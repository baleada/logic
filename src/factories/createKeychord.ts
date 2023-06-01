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
import { createMap } from '../pipes'

export type KeychordType = 'keydown' | 'keyup' | 'visibilitychange'

export type KeychordMetadata = {
  played: (
    {
      released: string,
    } & KeyboardTimeMetadata
  )[],
}

export type KeychordOptions = {
  minDuration?: number,
  maxInterval?: number,
  preventsDefaultUnlessDenied?: boolean,
  toKey?: CreatePredicateKeycomboDownOptions['toKey'],
  toAliases?: CreatePredicateKeycomboMatchOptions['toAliases'],
  onDown?: KeychordHook,
  onUp?: KeychordHook,
  onVisibilitychange?: KeychordHook,
}

export type KeychordHook = (api: KeychordHookApi) => any

export type KeychordHookApi = HookApi<KeychordType, KeychordMetadata>

const defaultOptions: KeychordOptions = {
  minDuration: 0,
  maxInterval: 5000, // VS Code default
  preventsDefaultUnlessDenied: true,
  toKey: fromAliasToKeyStatusKey,
  toAliases: fromEventToAliases,
}

export function createKeychord (
  keychord: string,
  options: KeychordOptions = {}
) {
  const {
          minDuration,
          maxInterval,
          preventsDefaultUnlessDenied,
          toKey,
          toAliases,
          onDown,
          onUp,
          onVisibilitychange,
        } = { ...defaultOptions, ...options },
        narrowedKeychord = keychord.split(' '),
        keyStates = createMap<string, ReturnType<typeof createKeyState>>(keycombo => createKeyState({
          keycomboOrKeycombos: keycombo,
          unsupportedAliases,
          toKey,
          toAliases,
          getRequest: () => request,
        }))(narrowedKeychord)

  let request: number,
      localStatus: RecognizeableStatus = 'recognizing',
      playedIndex = 0

  const keydown: RecognizeableEffect<'keydown', KeychordMetadata> = (event, api) => {
    const { denied, getStatus } = api,
          key = fromEventToKeyStatusKey(event)

    // REPEATED KEYDOWN
    if (keyStates[playedIndex].statuses.toValue(key) === 'down') {
      onDown?.(toHookApi(api))
      return
    }

    keyStates[playedIndex].statuses.set(key, 'down')

    // ALREADY DENIED
    if (localStatus === 'denied') {
      denied()
      onDown?.(toHookApi(api))
      return
    }

    const { getMetadata } = api,
          metadata = getMetadata(),
          downCombos = keyStates[playedIndex].getDownCombos()

    if (
      // NOT BUILDING VALID COMBO
      !keyStates[playedIndex].predicateValid(event)
      // TOO MANY VALID KEYS PRESSED
      || (
        downCombos.length > 1
        && fromComboToAliasesLength(downCombos[0]) === fromComboToAliasesLength(downCombos[1])
      )
      // INTERVAL TOO LONG
      || (
        playedIndex > 0
        && event.timeStamp - metadata.played[playedIndex - 1].times.end > maxInterval
      )
    ) {
      denied()
      localStatus = getStatus()
      if (includes(event.key)(unsupportedKeys) as boolean) {
        for (const { statuses } of keyStates) statuses.clear()
      }
      onDown?.(toHookApi(api))
      return
    }

    // BUILDING VALID KEYCOMBO
    if (preventsDefaultUnlessDenied) event.preventDefault()

    localStatus = 'recognizing'

    keyStates[playedIndex].cleanup()
    storeKeyboardTimeMetadata({
      event,
      api,
      getTimeMetadata: () => {
        const metadata = getMetadata()
        return (
          (
            metadata.played
            || (metadata.played = [])
          )[playedIndex]
          || (metadata.played[playedIndex] = {} as KeychordMetadata['played'][0])
        )
      },
      getShouldStore: () => downCombos.length && keyStates[playedIndex].getDownCombos()[0] === downCombos[0],
      setRequest: newRequest => request = newRequest,
    })

    onDown?.(toHookApi(api))
  }

  const keyup: RecognizeableEffect<'keyup', KeychordMetadata> = (event, api) => {
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
      
      for (const { statuses } of keyStates) {
        if (includes(event.key)(unsupportedKeys) as boolean) statuses.clear()
        else statuses.delete(key)
      }

      if (!predicateSomeKeyDown(keyStates[playedIndex].statuses)) {
        localStatus = 'recognizing'
        playedIndex = 0
      }
      onUp?.(toHookApi(api))
      return
    }

    const downCombos = keyStates[playedIndex].getDownCombos(),
          matches = keyStates[playedIndex].matchPredicatesByKeycombo[downCombos[0]]?.(keyStates[playedIndex].statuses)
    keyStates[playedIndex].statuses.delete(key)

    // RELEASING PARTIAL COMBO
    if (!downCombos.length || !matches) {
      onUp?.(toHookApi(api))
      return
    }

    // RELEASING FULL COMBO
    const playedIndexCached = playedIndex
    recognize(event, api)

    const status = getStatus()

    if (
      status !== 'recognized'
      && playedIndexCached !== playedIndex
    ) {
      metadata.played[playedIndexCached] = {
        ...metadata.played[playedIndexCached],
        released: downCombos[0],
      }

      for (const [key, status] of keyStates[playedIndexCached].statuses.toEntries()) {
        keyStates[playedIndex].statuses.set(key, status)
      }

      if (preventsDefaultUnlessDenied) event.preventDefault()
      if (!predicateSomeKeyDown(keyStates[playedIndex].statuses)) localStatus = 'recognizing'
      onUp?.(toHookApi(api))
      return
    }

    if (status === 'recognized') {
      localStatus = status
      metadata.played[playedIndex] = {
        ...metadata.played[playedIndex],
        released: downCombos[0],
      }
    }

    if (preventsDefaultUnlessDenied) event.preventDefault()
    if (!predicateSomeKeyDown(keyStates[playedIndex].statuses)) localStatus = 'recognizing'
    onUp?.(toHookApi(api))
  }

  const recognize: RecognizeableEffect<KeychordType, KeychordMetadata> = (event, api) => {
    const { getMetadata, recognized, denied } = api,
          metadata = getMetadata()

    if (metadata.played[playedIndex].duration < minDuration) {
      denied()
      return
    }
    
    if (playedIndex === narrowedKeychord.length - 1) {
      recognized()
      return
    }

    playedIndex++
  }

  const visibilitychange: RecognizeableEffect<'visibilitychange', KeychordMetadata> = (event, api) => {
    if (document.visibilityState === 'hidden') {
      for (const { statuses } of keyStates) statuses.clear()
      localStatus = 'recognizing'
      keyStates[playedIndex].cleanup()
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
