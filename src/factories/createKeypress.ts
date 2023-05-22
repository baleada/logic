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
import type { RecognizeableEffect, RecognizeableStatus } from '../classes'
import {
  toHookApi,
  storeKeyboardTimeMetadata,
  createPredicateKeycomboDown,
  createPredicateKeycomboMatch,
  createKeyStatuses,
  fromComboToAliases,
  fromEventToAliases,
  fromEventToKeyStatusKey,
  fromComboToAliasesLength,
} from '../extracted'
import type {
  HookApi,
  KeyboardTimeMetadata,
  KeyStatuses,
  CreatePredicateKeycomboDownOptions,
  CreatePredicateKeycomboMatchOptions,
} from '../extracted'
import { createFilter } from '../pipes'

export type KeypressType = 'keydown' | 'keyup' | 'visibilitychange'

export type KeypressMetadata = {
  pressed: string,
} & KeyboardTimeMetadata

export type KeypressOptions = {
  minDuration?: number,
  preventsDefaultUnlessDenied?: boolean,
  toKey?: CreatePredicateKeycomboDownOptions['toKey'],
  toAliases?: CreatePredicateKeycomboMatchOptions['toAliases'],
  onDown?: KeypressHook,
  onUp?: KeypressHook,
  onVisibilityChange?: KeypressHook,
}

export type KeypressHook = (api: KeypressHookApi) => any

export type KeypressHookApi = HookApi<KeypressType, KeypressMetadata>

const defaultOptions: KeypressOptions = {
  minDuration: 0,
  preventsDefaultUnlessDenied: true,
  toKey: undefined,
  toAliases: fromEventToAliases,
}

export function createKeypress (
  keycomboOrKeycombos: string | string[],
  options: KeypressOptions = {}
) {
  const {
          minDuration,
          preventsDefaultUnlessDenied,
          toKey,
          toAliases,
          onDown,
          onUp,
          onVisibilityChange,
        } = { ...defaultOptions, ...options },
        narrowedKeycombos = createFilter<string>(
          keycombo => !some<string>(
            alias => includes(alias)(unsupportedAliases) as boolean
          )(fromComboToAliases(keycombo))
        )(Array.isArray(keycomboOrKeycombos) ? keycomboOrKeycombos : [keycomboOrKeycombos]),
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
        createPredicateKeycomboMatchOptions = toAliases ? { ...createPredicateKeycomboDownOptions, toAliases } : createPredicateKeycomboDownOptions,
        matchPredicatesByKeycombo = (() => {
          const predicates: { [keycombo: string]: ReturnType<typeof createPredicateKeycomboMatch> } = {}

          for (const keycombo of narrowedKeycombos) {
            predicates[keycombo] = createPredicateKeycomboMatch(
                keycombo,
                createPredicateKeycomboMatchOptions
            )
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
        cleanup = () => {
          window.cancelAnimationFrame(request)
        },
        statuses = createKeyStatuses()

  let request: number
  let localStatus: RecognizeableStatus

  const keydown: RecognizeableEffect<'keydown', KeypressMetadata> = (event, api) => {
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
      if (includes(event.key)(unsupportedKeys) as boolean) statuses.clear()
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

    const { getMetadata } = api,
          metadata = getMetadata()

    metadata.pressed = downCombos[0]
    localStatus = 'recognizing'

    cleanup()
    storeKeyboardTimeMetadata(
      event,
      api,
      () => downCombos.length && getDownCombos()[0] === downCombos[0],
      newRequest => request = newRequest,
      recognize,
    )

    onDown?.(toHookApi(api))
  }

  const recognize: RecognizeableEffect<KeypressType, KeypressMetadata> = (event, api) => {
    const { getMetadata, recognized } = api,
          metadata = getMetadata()

    if (metadata.duration >= minDuration) {
      recognized()
      localStatus = 'recognized'
      return
    }
  }

  const keyup: RecognizeableEffect<'keyup', KeypressMetadata> = (event, api) => {
    const { denied } = api,
          key = fromEventToKeyStatusKey(event)
                
    // SHOULD BLOCK EVENT
    if (localStatus === 'denied') {
      denied()
      
      if (includes(event.key)(unsupportedKeys) as boolean) statuses.clear()
      else statuses.delete(key)

      if (!predicateSomeKeyDown(statuses)) localStatus = 'recognizing'
      onUp?.(toHookApi(api))
      return
    }

    statuses.delete(key)

    const downCombos = getDownCombos(),
          matches = matchPredicatesByKeycombo[downCombos[0]]?.(statuses)

    if (downCombos.length && matches) {
      const { getMetadata } = api,
            metadata = getMetadata()

      metadata.pressed = downCombos[0]

      if (preventsDefaultUnlessDenied) event.preventDefault()

      localStatus = 'recognizing'

      onUp?.(toHookApi(api))
      return
    }

    denied()
    cleanup()
    onUp?.(toHookApi(api))
  }

  const visibilitychange: RecognizeableEffect<'visibilitychange', KeypressMetadata> = (event, api) => {
    if (document.visibilityState === 'hidden') {
      statuses.clear()
      localStatus = 'recognizing'
      cleanup()
    }

    onVisibilityChange?.(toHookApi(api))
  }

  return {
    keydown,
    keyup,
    visibilitychange,
  }
}

// MacOS doesn't fire keyup while meta is still pressed
const unsupportedAliases = ['meta', 'command', 'cmd']
const unsupportedKeys = ['Meta']

const predicateSomeKeyDown = (statuses: KeyStatuses) => includes<string>('down')(statuses.toValues()) as boolean