import {
  filter,
  sort,
  map,
  pipe,
  toArray,
  unique,
  some,
  flatMap,
  includes,
} from 'lazy-collections'
import type { RecognizeableEffect, RecognizeableStatus } from '../../classes'
import {
  toHookApi,
  storeKeyboardTimeMetadata,
  createPredicateKeycomboDown,
  createKeyStatuses,
  fromComboToAliases,
  fromEventToAliases,
  fromEventToKeyStatusKey,
  fromComboToAliasesLength,
} from '../../extracted'
import type {
  HookApi,
  KeyboardTimeMetadata,
  KeyStatuses,
  CreatePredicateKeycomboDownOptions,
} from '../../extracted'

export type KeyreleaseType = 'keydown' | 'keyup'

export type KeyreleaseMetadata = {
  released: string,
} & KeyboardTimeMetadata

export type KeyreleaseOptions = {
  minDuration?: number,
  preventsDefaultUnlessDenied?: boolean,
  toKey?: CreatePredicateKeycomboDownOptions['toKey'],
  toAliases?: (event: KeyboardEvent) => string[],
  onDown?: KeyreleaseHook,
  onUp?: KeyreleaseHook,
}

export type KeyreleaseHook = (api: KeyreleaseHookApi) => any

export type KeyreleaseHookApi = HookApi<KeyreleaseType, KeyreleaseMetadata>

const defaultOptions: KeyreleaseOptions = {
  minDuration: 0,
  preventsDefaultUnlessDenied: true,
  toKey: undefined,
  toAliases: fromEventToAliases,
}

export function createKeyrelease (
  keycomboOrKeycombos: string | string[],
  options: KeyreleaseOptions = {}
) {
  const {
          minDuration,
          preventsDefaultUnlessDenied,
          toKey,
          toAliases,
          onDown,
          onUp,
        } = { ...defaultOptions, ...options },
        narrowedKeycombos = Array.isArray(keycomboOrKeycombos) ? keycomboOrKeycombos : [keycomboOrKeycombos],
        createPredicateKeycomboDownOptions = toKey ? { toKey } : {},
        downPredicatesByKeycombo = (() => {
          const predicates: [string, ReturnType<typeof createPredicateKeycomboDown>][] = []

          for (const keycombo of narrowedKeycombos) {
            predicates.push([
              keycombo,
              createPredicateKeycomboDown(
                keycombo,
                createPredicateKeycomboDownOptions
              ),
            ])
          }

          return predicates
        })(),
        validAliases = pipe<typeof narrowedKeycombos>(
          flatMap<typeof narrowedKeycombos[0], string[]>(fromComboToAliases),
          unique(),
          toArray(),
        )(narrowedKeycombos) as string[],
        getDownCombos = () => pipe(
          filter<typeof downPredicatesByKeycombo[0]>(([, predicate]) => predicate(statuses)),
          map<typeof downPredicatesByKeycombo[0], [string, string[]]>(([keycombo]) => [keycombo, fromComboToAliases(keycombo)]),
          sort<string>(([,aliasesA], [,aliasesB]) => aliasesB.length - aliasesA.length),
          map<string[], string>(([keycombo]) => keycombo),
          toArray()
        )(downPredicatesByKeycombo) as typeof narrowedKeycombos,
        predicateValid = (event: KeyboardEvent) => {
          const aliases = toAliases(event)

          return some<typeof validAliases[0]>(
            validAlias => includes<string>(validAlias)(aliases) as boolean
          )(validAliases) as boolean
        },
        getPressed = () => pipe(
          filter<typeof downPredicatesByKeycombo[0]>(([, predicate]) => predicate(statuses)),
          map<typeof downPredicatesByKeycombo[0], string>(([keycombo]) => keycombo),
          toArray()
        )(downPredicatesByKeycombo) as string[],
        cleanup = () => {
          window.cancelAnimationFrame(request)
        },
        statuses = createKeyStatuses()

  let request: number
  let localStatus: RecognizeableStatus

  const keydown: RecognizeableEffect<KeyreleaseType, KeyreleaseMetadata> = (event, api) => {
    const { denied, getStatus } = api,
          key = fromEventToKeyStatusKey(event)

    // REPEATED KEYDOWN
    if (statuses.toValue(key) === 'down') {
      onDown?.(toHookApi(api))
      return
    }

    statuses.set(key, 'down')

    // ALREADY DENIED
    if (localStatus === 'denied') {
      denied()
      onDown?.(toHookApi(api))
      return
    }

    // NOT BUILDING VALID COMBO
    if (!predicateValid(event)) {
      denied()
      localStatus = getStatus()
      onDown?.(toHookApi(api))
      return
    }

    const downCombos = getDownCombos()

    // TOO MANY VALID KEYS PRESSED
    if (
      downCombos.length > 1
      && fromComboToAliasesLength(downCombos[0]) === fromComboToAliasesLength(downCombos[1])
    ) {
      denied()
      localStatus = getStatus()
      onDown?.(toHookApi(api))
      return
    }

    // BUILDING VALID KEYCOMBO
    if (preventsDefaultUnlessDenied) event.preventDefault()

    localStatus = 'recognizing'

    cleanup()
    storeKeyboardTimeMetadata(
      event,
      api,
      () => downCombos.length && getPressed().includes(downCombos[0]),
      newRequest => request = newRequest,
    )

    onDown?.(toHookApi(api))
  }

  const keyup: RecognizeableEffect<'keyup', KeyreleaseMetadata> = (event, api) => {
    const {
            getStatus,
            getMetadata,
            denied,
          } = api,
          metadata = getMetadata(),
          key = fromEventToKeyStatusKey(event)
                
    // SHOULD BLOCK EVENT
    if (['denied', 'recognized'].includes(localStatus)) {
      if (localStatus === 'denied') denied()
      if (predicateValid(event)) statuses.set(key, 'up')
      else statuses.delete(key)

      if (!predicateSomeKeyDown(statuses)) localStatus = 'recognizing'
      onUp?.(toHookApi(api))
      return
    }

    const downCombos = getDownCombos()
    console.log(downCombos)
    statuses.set(key, 'up')

    // RELEASING PARTIAL COMBO
    if (!downCombos.length) {
      onUp?.(toHookApi(api))
      return
    }

    // RELEASING FULL COMBO
    recognize(event, api)

    const status = getStatus()

    if (status === 'recognized') {
      localStatus = status
      metadata.released = downCombos[0]
    }

    if (preventsDefaultUnlessDenied) event.preventDefault()
    if (!predicateSomeKeyDown(statuses)) localStatus = 'recognizing'
    onUp?.(toHookApi(api))
  }

  const recognize: RecognizeableEffect<KeyreleaseType, KeyreleaseMetadata> = (event, api) => {
    const { getMetadata, recognized, denied } = api,
          metadata = getMetadata()

    if (metadata.duration < minDuration) {
      denied()
      return
    }

    if (localStatus !== 'recognized') recognized()
  }

  return {
    keydown,
    keyup,
  }
}

const predicateSomeKeyDown = (statuses: KeyStatuses) => includes<string>('down')(statuses.toValues()) as boolean
