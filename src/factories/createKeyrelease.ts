import { includes } from 'lazy-collections'
import type { RecognizeableEffect, RecognizeableStatus } from '../classes'
import {
  toHookApi,
  storeKeyboardTimeMetadata,
  fromEventToKeyStatusKey,
  fromComboToAliasesLength,
  createKeyState,
  predicateSomeKeyDown,
  fromAliasToKeyStatusKey,
  fromEventToAliases,
} from '../extracted'
import type {
  HookApi,
  KeyboardTimeMetadata,
  CreatePredicateKeycomboDownOptions,
  CreatePredicateKeycomboMatchOptions,
} from '../extracted'

export type KeyreleaseType = 'keydown' | 'keyup' | 'visibilitychange'

export type KeyreleaseMetadata = {
  released: string,
} & KeyboardTimeMetadata

export type KeyreleaseOptions = {
  minDuration?: number,
  preventsDefaultUnlessDenied?: boolean,
  toKey?: CreatePredicateKeycomboDownOptions['toKey'],
  toAliases?: CreatePredicateKeycomboMatchOptions['toAliases'],
  onDown?: KeyreleaseHook,
  onUp?: KeyreleaseHook,
  onVisibilitychange?: KeyreleaseHook,
}

export type KeyreleaseHook = (api: KeyreleaseHookApi) => any

export type KeyreleaseHookApi = HookApi<KeyreleaseType, KeyreleaseMetadata>

const defaultOptions: KeyreleaseOptions = {
  minDuration: 0,
  preventsDefaultUnlessDenied: true,
  toKey: alias => fromAliasToKeyStatusKey(alias),
  toAliases: event => fromEventToAliases(event as KeyboardEvent),
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
          onVisibilitychange,
        } = { ...defaultOptions, ...options },
        {
          matchPredicatesByKeycombo,
          getDownCombos,
          predicateValid,
          cleanup,
          statuses,
        } = createKeyState({
          keycomboOrKeycombos,
          unsupportedAliases,
          toKey,
          toAliases,
          getRequest: () => request,
        })

  let request: number,
      localStatus: RecognizeableStatus

  const keydown: RecognizeableEffect<'keydown', KeyreleaseMetadata> = (event, api) => {
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
      if (includes(event.key)(unsupportedKeys) as boolean) statuses.clear()
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
          key = fromEventToKeyStatusKey(event)
                
    // SHOULD BLOCK EVENT
    if (['denied', 'recognized'].includes(localStatus)) {
      if (localStatus === 'denied') denied()
      
      if (includes(event.key)(unsupportedKeys) as boolean) statuses.clear()
      else statuses.delete(key)

      if (!predicateSomeKeyDown(statuses)) localStatus = 'recognizing'
      onUp?.(toHookApi(api))
      return
    }

    const downCombos = getDownCombos(),
          matches = matchPredicatesByKeycombo[downCombos[0]]?.(statuses)
    statuses.delete(key)

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
      statuses.clear()
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

// MacOS doesn't fire keyup while meta is still pressed
const unsupportedAliases = ['meta', 'command', 'cmd']
const unsupportedKeys = ['Meta']
