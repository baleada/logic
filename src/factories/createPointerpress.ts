import { Listenable } from '../classes/Listenable'
import type {
  RecognizeableEffect,
  ListenEffectParam,
  RecognizeableStopTarget,
} from '../classes'
import { toHookApi, storePointerStartMetadata, storePointerMoveMetadata, storePointerTimeMetadata } from '../extracted'
import type { PointerStartMetadata, PointerMoveMetadata, PointerTimeMetadata, HookApi } from '../extracted'
import {  } from '../classes/Recognizeable'

export type PointerpressType = 'pointerdown' | 'pointerout' | 'pointerup'

export type PointerpressMetadata = PointerStartMetadata
  & PointerMoveMetadata
  & PointerTimeMetadata

export type PointerpressOptions = {
  minDuration?: number,
  minDistance?: number,
  onDown?: PointerpressHook,
  onMove?: PointerpressHook,
  onOut?: PointerpressHook,
  onUp?: PointerpressHook,
}

export type PointerpressHook = (api: PointerpressHookApi) => any

export type PointerpressHookApi = HookApi<PointerpressType, PointerpressMetadata>

const defaultOptions: PointerpressOptions = {
  minDuration: 0,
  minDistance: 0,
}

/**
 * [Docs](https://baleada.dev/docs/logic/factories/pointerpress)
 */
export function createPointerpress (options: PointerpressOptions = {}) {
  const {
          minDuration,
          minDistance,
          onDown,
          onOut,
          onMove,
          onUp,
        } = { ...defaultOptions, ...options },
        stop = (target: RecognizeableStopTarget<PointerpressType>) => {
          window.cancelAnimationFrame(request)
          target.removeEventListener('pointermove', pointermoveEffect)
        }

  let request: number
  let pointermoveEffect: (event: ListenEffectParam<'pointermove'>) => void
  let pointerStatus: 'down' | 'up' | 'leave'

  const pointerdown: RecognizeableEffect<'pointerdown', PointerpressMetadata> = (event, api) => {
    pointerStatus = 'down'
    // @ts-expect-error
    pointermoveEffect = event => pointermove(event, api)

    storePointerStartMetadata({ event, api })
    storePointerMoveMetadata({ event, api })
    storePointerTimeMetadata({
      event,
      api,
      getShouldStore: () => pointerStatus === 'down',
      setRequest: newRequest => request = newRequest,
      // @ts-expect-error
      recognize,
    })

    const { listenInjection: { optionsByType: { pointerdown: { target } } } } = api
    target.addEventListener('pointermove', pointermoveEffect)

    onDown?.(toHookApi(api))
  }

  const pointermove: RecognizeableEffect<'pointermove', PointerpressMetadata> = (event, api) => {
    const { pushSequence } = api
    pushSequence(event)
    storePointerMoveMetadata({ event, api })
    // @ts-expect-error
    recognize(event, api)

    onMove?.(toHookApi(api))
  }

  const recognize: RecognizeableEffect<'pointerdown' | 'pointermove', PointerpressMetadata> = (event, api) => {
    const { getMetadata, recognized } = api,
          metadata = getMetadata()

    if (
      metadata.duration >= minDuration
      && metadata.distance.straight.fromStart >= minDistance
    ) {
      recognized()
    }
  }

  const pointerout: RecognizeableEffect<'pointerout', PointerpressMetadata> = (event, api) => {
    const { denied, listenInjection: { optionsByType: { pointerout: { target } } } } = api

    if (
      event.target !== target
      && (target as Element | Document).contains?.(event.relatedTarget as Node)
    ) {
      onOut?.(toHookApi(api))
      return
    }

    if (pointerStatus === 'down') {
      denied()
      stop(target)
      pointerStatus = 'leave'
    }

    onOut?.(toHookApi(api))
  }

  const pointerup: RecognizeableEffect<'pointerup', PointerpressMetadata> = (event, api) => {
    const { denied, listenInjection: { optionsByType: { pointerup: { target } } } } = api

    if (pointerStatus !== 'down') return

    denied()
    stop(target)
    pointerStatus = 'up'

    onUp?.(toHookApi(api))
  }

  return {
    pointerdown: {
      effect: pointerdown,
      stop,
    },
    pointerout,
    pointerup,
  }
}

export class Pointerpress extends Listenable<PointerpressType, PointerpressMetadata> {
  constructor (options?: PointerpressOptions) {
    super(
      'recognizeable' as PointerpressType,
      {
        recognizeable: {
          effects: createPointerpress(options),
        },
      }
    )
  }

  get metadata () {
    return this.recognizeable.metadata
  }
}
