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
  onVisibilitychange?: KeypressHook,
}

export type KeypressHook = (api: KeypressHookApi) => any

export type KeypressHookApi = HookApi<KeypressType, KeypressMetadata>

const defaultOptions: KeypressOptions = {
  minDuration: 0,
  preventsDefaultUnlessDenied: true,
  toKey: alias => fromAliasToKeyStatusKey(alias),
  toAliases: event => fromEventToAliases(event as KeyboardEvent),
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

    const { getMetadata } = api,
          metadata = getMetadata()

    metadata.pressed = downCombos[0]
    localStatus = 'recognizing'

    cleanup()
    storeKeyboardTimeMetadata({
      event,
      api,
      getTimeMetadata: getMetadata,
      getShouldStore: () => downCombos.length && getDownCombos()[0] === downCombos[0],
      setRequest: newRequest => request = newRequest,
      recognize,
    })

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
