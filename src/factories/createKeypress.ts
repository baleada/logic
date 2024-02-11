
import { includes } from 'lazy-collections'
import { Listenable } from '../classes/Listenable'
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

export type KeypressType = 'keydown' | 'keyup' | 'visibilitychange'

export type KeypressMetadata = {
  keycombo: string,
} & KeyboardTimeMetadata

export type KeypressOptions = CreateKeycomboMatchOptions & {
  minDuration?: number,
  preventsDefaultUnlessDenied?: boolean,
  onDown?: KeypressHook,
  onUp?: KeypressHook,
  onVisibilitychange?: KeypressHook,
}

export type KeypressHook = (api: KeypressHookApi) => any

export type KeypressHookApi = HookApi<KeypressType, KeypressMetadata>

const defaultOptions: KeypressOptions = {
  minDuration: 0,
  preventsDefaultUnlessDenied: true,
  toCode: alias => fromAliasToCode(alias),
  toAliases: code => fromCodeToAliases(code),
}

// TODO: window blur clear state
export function createKeypress (
  keycomboOrKeycombos: string | string[],
  options: KeypressOptions = {}
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
          stop,
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
        fromComboToAliasesLength = createAliasesLength({ toLonghand }),
        maybeAddWindowBlurListener = () => {
          if (windowBlurStatus === 'added') return
          window.addEventListener('blur', onWindowBlur)
          windowBlurStatus = 'added'
        },
        onWindowBlur = () => {
          clearStatuses()
          localStatus = 'recognizing'
          stop()
        }

  let request: number,
      localStatus: RecognizeableStatus,
      windowBlurStatus: 'added' | 'removed' = 'removed'

  const keydown: RecognizeableEffect<'keydown', KeypressMetadata> = (event, api) => {
    maybeAddWindowBlurListener()

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

    const { getMetadata } = api,
          metadata = getMetadata()

    metadata.keycombo = downCombos[0]
    localStatus = 'recognizing'

    stop()
    storeKeyboardTimeMetadata({
      event,
      api,
      getTimeMetadata: getMetadata,
      getShouldStore: () => downCombos.length && getDownCombos()[0] === downCombos[0],
      setRequest: newRequest => request = newRequest,
      // @ts-expect-error
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
          key = fromEventToKeyStatusCode(event)
                
    // SHOULD BLOCK EVENT
    if (localStatus === 'denied') {
      denied()
      
      if (includes(event.key)(unsupportedKeys) as boolean) clearStatuses()
      else deleteStatus(key)

      if (!predicateSomeKeyDown(statuses)) localStatus = 'recognizing'
      onUp?.(toHookApi(api))
      return
    }

    deleteStatus(key)

    const downCombos = getDownCombos(),
          matches = matchPredicatesByKeycombo[downCombos[0]]?.(statuses)

    if (downCombos.length && matches) {
      const { getMetadata } = api,
            metadata = getMetadata()

      metadata.keycombo = downCombos[0]

      if (preventsDefaultUnlessDenied) event.preventDefault()

      localStatus = 'recognizing'

      onUp?.(toHookApi(api))
      return
    }

    denied()
    stop()
    onUp?.(toHookApi(api))
  }

  const visibilitychange: RecognizeableEffect<'visibilitychange', KeypressMetadata> = (event, api) => {
    if (document.visibilityState === 'hidden') onWindowBlur()
    onVisibilitychange?.(toHookApi(api))
  }

  return {
    keydown: {
      effect: keydown,
      stop: () => {
        window.removeEventListener('blur', onWindowBlur)
      },
    },
    keyup,
    visibilitychange,
  }
}

export class Keypress extends Listenable<KeypressType, KeypressMetadata> {
  constructor (keycomboOrKeycombos: string | string[], options?: KeypressOptions) {
    super(
      'recognizeable' as KeypressType,
      {
        recognizeable: {
          effects: createKeypress(keycomboOrKeycombos, options),
        },
      }
    )
  }

  get metadata () {
    return this.recognizeable.metadata
  }
}
