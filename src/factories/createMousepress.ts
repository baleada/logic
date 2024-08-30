import { Listenable } from '../classes/Listenable'
import type {
  RecognizeableEffect,
  ListenEffectParam,
  RecognizeableStopTarget,
} from '../classes'
import { toHookApi, storePointerStartMetadata, storePointerMoveMetadata, storePointerTimeMetadata } from '../extracted'
import type { PointerStartMetadata, PointerMoveMetadata, PointerTimeMetadata, HookApi } from '../extracted'
import {  } from '../classes/Recognizeable'

export type MousepressType = 'mousedown' | 'mouseleave' | 'mouseup'

export type MousepressMetadata = PointerStartMetadata
  & PointerMoveMetadata
  & PointerTimeMetadata<true>

export type MousepressOptions = {
  minDuration?: number,
  minDistance?: number,
  onDown?: MousepressHook,
  onMove?: MousepressHook,
  onLeave?: MousepressHook,
  onUp?: MousepressHook,
}

export type MousepressHook = (api: MousepressHookApi) => any

export type MousepressHookApi = HookApi<MousepressType, MousepressMetadata>

const defaultOptions: MousepressOptions = {
  minDuration: 0,
  minDistance: 0,
}

/**
 * [Docs](https://baleada.dev/docs/logic/factories/mousepress)
 */
export function createMousepress (options: MousepressOptions = {}) {
  const {
          minDuration,
          minDistance,
          onDown,
          onLeave,
          onMove,
          onUp,
        } = { ...defaultOptions, ...options },
        stop = (target: RecognizeableStopTarget<MousepressType>) => {
          window.cancelAnimationFrame(request)
          target.removeEventListener('mousemove', mousemoveEffect)
        }

  let request: number
  let mousemoveEffect: (event: ListenEffectParam<'mousemove'>) => void
  let mouseStatus: 'down' | 'up' | 'leave'

  const mousedown: RecognizeableEffect<'mousedown', MousepressMetadata> = (event, api) => {
    mouseStatus = 'down'
    // @ts-expect-error
    mousemoveEffect = event => mousemove(event, api)

    storePointerStartMetadata({ event, api })
    storePointerMoveMetadata({ event, api })
    storePointerTimeMetadata({
      event,
      moves: true,
      api,
      getShouldStore: () => mouseStatus === 'down',
      setRequest: newRequest => request = newRequest,
      // @ts-expect-error
      recognize,
    })

    const { listenInjection: { optionsByType: { mousedown: { target } } } } = api
    target.addEventListener('mousemove', mousemoveEffect)

    onDown?.(toHookApi(api))
  }

  const mousemove: RecognizeableEffect<'mousemove', MousepressMetadata> = (event, api) => {
    const { pushSequence } = api
    pushSequence(event)
    storePointerMoveMetadata({ event, api })
    // @ts-expect-error
    recognize(event, api)

    onMove?.(toHookApi(api))
  }

  const recognize: RecognizeableEffect<'mousedown' | 'mousemove', MousepressMetadata> = (event, api) => {
    const { getMetadata, recognized } = api,
          metadata = getMetadata()

    if (
      metadata.duration >= minDuration
      && metadata.distance.straight.fromStart >= minDistance
    ) {
      recognized()
    }
  }

  const mouseleave: RecognizeableEffect<'mouseleave', MousepressMetadata> = (event, api) => {
    const { denied, listenInjection: { optionsByType: { mouseleave: { target } } } } = api

    if (mouseStatus === 'down') {
      denied()
      stop(target)
      mouseStatus = 'leave'
    }

    onLeave?.(toHookApi(api))
  }

  const mouseup: RecognizeableEffect<'mouseup', MousepressMetadata> = (event, api) => {
    const { denied, listenInjection: { optionsByType: { mouseup: { target } } } } = api

    if (mouseStatus !== 'down') return

    denied()
    stop(target)
    mouseStatus = 'up'

    onUp?.(toHookApi(api))
  }

  return {
    mousedown: {
      effect: mousedown,
      stop,
    },
    mouseleave,
    mouseup,
  }
}

export class Mousepress extends Listenable<MousepressType, MousepressMetadata> {
  constructor (options?: MousepressOptions) {
    super(
      'recognizeable' as MousepressType,
      {
        recognizeable: {
          effects: createMousepress(options),
        },
      }
    )
  }

  get metadata () {
    return this.recognizeable.metadata
  }
}
