import { includes } from 'lazy-collections'
import type { RecognizeableEffect, RecognizeableStatus } from '../classes'
import {
  toHookApi,
  storeKeyboardTimeMetadata,
  fromEventToKeyStatusCode,
  fromComboToAliasesLength,
  createKeyState,
  predicateSomeKeyDown,
  fromAliasToDownCodes,
  fromEventToAliases,
} from '../extracted'
import type {
  HookApi,
  KeyboardTimeMetadata,
  CreateKeycomboDownOptions,
  CreateKeycomboMatchOptions,
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
  toDownCodes?: CreateKeycomboDownOptions['toDownCodes'],
  toAliases?: CreateKeycomboMatchOptions['toAliases'],
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
  toDownCodes: alias => fromAliasToDownCodes(alias),
  toAliases: code => fromEventToAliases({ code } as KeyboardEvent),
}

export function createKeychord (
  keychord: string,
  options: KeychordOptions = {}
) {
  const {
          minDuration,
          maxInterval,
          preventsDefaultUnlessDenied,
          toDownCodes,
          toAliases,
          onDown,
          onUp,
          onVisibilitychange,
        } = { ...defaultOptions, ...options },
        narrowedKeychord = keychord.split(' '),
        keyStates = createMap<string, ReturnType<typeof createKeyState>>(keycombo => createKeyState({
          keycomboOrKeycombos: keycombo,
          unsupportedAliases,
          toDownCodes,
          toAliases,
          getRequest: () => request,
        }))(narrowedKeychord),
        localStatuses = createMap<typeof keyStates[number], RecognizeableStatus>(
          () => 'recognizing'
        )(keyStates)

  let request: number,
      playedIndex = 0

  const keydown: RecognizeableEffect<'keydown', KeychordMetadata> = (event, api) => {
    const { denied, getStatus } = api,
          key = fromEventToKeyStatusCode(event)

    // REPEATED KEYDOWN
    if (keyStates[playedIndex].toStatus(key) === 'down') {
      onDown?.(toHookApi(api))
      return
    }

    if (localStatuses[playedIndex] === 'recognized') {
      playedIndex++
      for (const [key, status] of keyStates[playedIndex - 1].statuses) {
        keyStates[playedIndex].setStatus(key, status)
      }
    }
    keyStates[playedIndex].setStatus(key, 'down')

    // ALREADY DENIED
    if (localStatuses[playedIndex] === 'denied') {
      denied()
      onDown?.(toHookApi(api))
      return
    }

    const { getMetadata } = api,
          metadata = getMetadata(),
          downCombos = keyStates[playedIndex].getDownCombos()
    
    if (playedIndex === 0) metadata.played = []

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
      localStatuses[playedIndex] = getStatus()
      if (includes(event.key)(unsupportedKeys) as boolean) {
        for (const { clearStatuses } of keyStates) clearStatuses()
      }
      onDown?.(toHookApi(api))
      return
    }

    // BUILDING VALID KEYCOMBO
    if (preventsDefaultUnlessDenied) event.preventDefault()

    localStatuses[playedIndex] = 'recognizing'

    keyStates[playedIndex].cleanup()
    storeKeyboardTimeMetadata({
      event,
      api,
      getTimeMetadata: () => {
        const metadata = getMetadata()
        return (
          metadata.played[playedIndex]
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
          key = fromEventToKeyStatusCode(event)
                
    // ALREADY ACTED ON MULTI-KEY COMBO
    if (['denied', 'recognized'].includes(localStatuses[playedIndex])) {
      if (localStatuses[playedIndex] === 'denied') denied()
      
      for (const { clearStatuses, deleteStatus } of keyStates) {
        if (includes(event.key)(unsupportedKeys) as boolean) clearStatuses()
        else deleteStatus(key)
      }

      if (!predicateSomeKeyDown(keyStates[playedIndex].statuses)) {
        if (
          localStatuses[playedIndex] === 'denied'
          || (playedIndex === narrowedKeychord.length - 1 && localStatuses[playedIndex] === 'recognized')
        ) {
          playedIndex = 0
          for (let i = 0; i < localStatuses.length; i++) localStatuses[i] = 'recognizing'
          for (const { clearStatuses } of keyStates) clearStatuses()
        }
      }
      onUp?.(toHookApi(api))
      return
    }

    const downCombos = keyStates[playedIndex].getDownCombos(),
          matches = keyStates[playedIndex].matchPredicatesByKeycombo[downCombos[0]]?.(keyStates[playedIndex].statuses)
    keyStates[playedIndex].deleteStatus(key)

    // RELEASING PARTIAL COMBO
    if (!downCombos.length || !matches) {
      onUp?.(toHookApi(api))
      return
    }

    // RELEASING FULL COMBO
    recognize(event, api)

    const status = getStatus()

    if (
      (status === 'recognizing' && localStatuses[playedIndex] === 'recognized')
      || status === 'recognized'
    ) {
      metadata.played[playedIndex] = {
        ...metadata.played[playedIndex],
        released: downCombos[0],
      }
    }

    if (preventsDefaultUnlessDenied) event.preventDefault()
    if (
      playedIndex === narrowedKeychord.length - 1
      && !predicateSomeKeyDown(keyStates[playedIndex].statuses)
    ) {
      playedIndex = 0
      for (let i = 0; i < localStatuses.length; i++) localStatuses[i] = 'recognizing'
      for (const { clearStatuses } of keyStates) clearStatuses()
    }
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
      localStatuses[playedIndex] = 'recognized'
      return
    }

    localStatuses[playedIndex] = 'recognized'
  }

  const visibilitychange: RecognizeableEffect<'visibilitychange', KeychordMetadata> = (event, api) => {
    if (document.visibilityState === 'hidden') {
      for (const { clearStatuses } of keyStates) clearStatuses()
      localStatuses[playedIndex] = 'recognizing'
      keyStates[playedIndex].cleanup()
      playedIndex = 0
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
