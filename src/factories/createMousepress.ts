import type { ListenEffectParam, ListenOptions, RecognizeableEffect, RecognizeableOptions } from '../classes'
import { toHookApi, storePointerStartMetadata, storePointerMoveMetadata, storePointerTimeMetadata } from '../extracted'
import type { PointerStartMetadata, PointerMoveMetadata, PointerTimeMetadata, HookApi } from '../extracted'

export type MousepressType = 'mousedown' | 'mouseleave' | 'mouseup'

export type MousepressMetadata = PointerStartMetadata
  & PointerMoveMetadata
  & PointerTimeMetadata

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
export function createMousepress (options: MousepressOptions = {}): RecognizeableOptions<MousepressType, MousepressMetadata>['effects'] {
  const {
          minDuration,
          minDistance,
          onDown,
          onLeave,
          onMove,
          onUp,
        } = { ...defaultOptions, ...options },
        cleanup = (target: ListenOptions<MousepressType>['target']) => {
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

    storePointerStartMetadata(event, api)
    storePointerMoveMetadata(event, api)
    storePointerTimeMetadata(
      event,
      api,
      () => mouseStatus === 'down',
      newRequest => request = newRequest,
      // @ts-expect-error
      recognize,
    )

    const { listenInjection: { optionsByType: { mousedown: { target } } } } = api
    target.addEventListener('mousemove', mousemoveEffect)

    onDown?.(toHookApi(api))
  }

  const mousemove: RecognizeableEffect<'mousemove', MousepressMetadata> = (event, api) => {
    const { pushSequence } = api 
    pushSequence(event)
    storePointerMoveMetadata(event, api)
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
      cleanup(target)
      mouseStatus = 'leave'
    }

    onLeave?.(toHookApi(api))
  }

  const mouseup: RecognizeableEffect<'mouseup', MousepressMetadata> = (event, api) => {
    const { denied, listenInjection: { optionsByType: { mouseup: { target } } } } = api

    if (mouseStatus !== 'down') return
          
    denied()
    cleanup(target)
    mouseStatus = 'up'
    
    onUp?.(toHookApi(api))
  }

  return {
    mousedown,
    mouseleave,
    mouseup,
  }
}
