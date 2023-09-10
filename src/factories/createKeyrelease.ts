import { includes } from 'lazy-collections'
import type { RecognizeableEffect, RecognizeableStatus } from '../classes'
import {
  toHookApi,
  storeKeyboardTimeMetadata,
  fromEventToKeyStatusCode,
  createAliasesLength,
  createKeyState,
  unsupportedKeys,
  predicateSomeKeyDown,
  fromAliasToCode,
  fromCodeToAliases,
} from '../extracted'
import type {
  HookApi,
  KeyboardTimeMetadata,
  CreateKeycomboMatchOptions,
} from '../extracted'

export type KeyreleaseType = 'keydown' | 'keyup' | 'visibilitychange'

export type KeyreleaseMetadata = {
  released: string,
} & KeyboardTimeMetadata

export type KeyreleaseOptions = CreateKeycomboMatchOptions & {
  minDuration?: number,
  preventsDefaultUnlessDenied?: boolean,
  onDown?: KeyreleaseHook,
  onUp?: KeyreleaseHook,
  onVisibilitychange?: KeyreleaseHook,
}

export type KeyreleaseHook = (api: KeyreleaseHookApi) => any

export type KeyreleaseHookApi = HookApi<KeyreleaseType, KeyreleaseMetadata>

const defaultOptions: KeyreleaseOptions = {
  minDuration: 0,
  preventsDefaultUnlessDenied: true,
  toCode: alias => fromAliasToCode(alias),
  toAliases: code => fromCodeToAliases(code),
}

export function createKeyrelease (
  keycomboOrKeycombos: string | string[],
  options: KeyreleaseOptions = {}
) {
  const {
          minDuration,
          preventsDefaultUnlessDenied,
          toLonghand,
          toCode,
          toAliases,
          onDown,
          onUp,
          onVisibilitychange,
        } = { ...defaultOptions, ...options },
        {
          matchPredicatesByKeycombo,
          getDownCombos,
          predicateValid,
          cleanup,
          statuses,
          toStatus,
          setStatus,
          clearStatuses,
          deleteStatus,
        } = createKeyState({
          keycomboOrKeycombos,
          toLonghand,
          toCode,
          toAliases,
          getRequest: () => request,
        }),
        fromComboToAliasesLength = createAliasesLength({ toLonghand })

  let request: number,
      localStatus: RecognizeableStatus

  const keydown: RecognizeableEffect<'keydown', KeyreleaseMetadata> = (event, api) => {
    const { denied, getStatus } = api,
          key = fromEventToKeyStatusCode(event)

    // REPEATED KEYDOWN
    if (toStatus(key) === 'down') {
      onDown?.(toHookApi(api))
      return
    }

    setStatus(key, 'down')

    // ALREADY DENIED
    if (localStatus === 'denied') {
      denied()
      onDown?.(toHookApi(api))
      return
    }

    const downCombos = getDownCombos()

    // NOT BUILDING VALID COMBO
    if (
      // NOT BUILDING VALID COMBO
      !predicateValid(event)
      // TOO MANY VALID KEYS PRESSED
      || (
        downCombos.length > 1
        && fromComboToAliasesLength(downCombos[0]) === fromComboToAliasesLength(downCombos[1])
      )
    ) {
      denied()
      localStatus = getStatus()
      if (includes(event.key)(unsupportedKeys) as boolean) clearStatuses()
      onDown?.(toHookApi(api))
      return
    }

    // BUILDING VALID KEYCOMBO
    if (preventsDefaultUnlessDenied) event.preventDefault()

    const { getMetadata } = api

    localStatus = 'recognizing'

    cleanup()
    storeKeyboardTimeMetadata({
      event,
      api,
      getTimeMetadata: getMetadata,
      getShouldStore: () => downCombos.length && getDownCombos()[0] === downCombos[0],
      setRequest: newRequest => request = newRequest,
    })

    onDown?.(toHookApi(api))
  }

  const keyup: RecognizeableEffect<'keyup', KeyreleaseMetadata> = (event, api) => {
    const {
            getStatus,
            getMetadata,
            denied,
          } = api,
          metadata = getMetadata(),
          key = fromEventToKeyStatusCode(event)
                
    // SHOULD BLOCK EVENT
    if (['denied', 'recognized'].includes(localStatus)) {
      if (localStatus === 'denied') denied()
      
      if (includes(event.key)(unsupportedKeys) as boolean) clearStatuses()
      else deleteStatus(key)

      if (!predicateSomeKeyDown(statuses)) localStatus = 'recognizing'
      onUp?.(toHookApi(api))
      return
    }

    const downCombos = getDownCombos(),
          matches = matchPredicatesByKeycombo[downCombos[0]]?.(statuses)
    deleteStatus(key)

    // RELEASING PARTIAL COMBO
    if (!downCombos.length || !matches) {
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
    onUp?.(toHookApi(api))
  }

  const recognize: RecognizeableEffect<KeyreleaseType, KeyreleaseMetadata> = (event, api) => {
    const { getMetadata, recognized, denied } = api,
          metadata = getMetadata()

    if (metadata.duration < minDuration) {
      denied()
      return
    }

    recognized()
  }

  const visibilitychange: RecognizeableEffect<'visibilitychange', KeyreleaseMetadata> = (event, api) => {
    if (document.visibilityState === 'hidden') {
      clearStatuses()
      localStatus = 'recognizing'
      cleanup()
    }

    onVisibilitychange?.(toHookApi(api))
  }

  return {
    keydown,
    keyup,
    visibilitychange,
  }
}
