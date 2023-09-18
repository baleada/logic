import { Listenable, type RecognizeableEffect, type RecognizeableOptions } from '../classes'
import { toHookApi, storePointerStartMetadata, storePointerMoveMetadata, storePointerTimeMetadata } from '../extracted'
import type { PointerStartMetadata, PointerMoveMetadata, PointerTimeMetadata, HookApi } from '../extracted'

/*
 * touchpress is defined as a single touchstart that:
 * - starts at a given point
 * - travels a distance greater than or equal to 0px (or a minimum distance of your choice)
 * - does not touchcancel or end before 0ms (or a minimum duration of your choice) has elapsed
 */

export type TouchpressType = 'touchstart' | 'touchmove' | 'touchcancel' | 'touchend'

export type TouchpressMetadata = PointerStartMetadata
  & PointerMoveMetadata
  & PointerTimeMetadata

export type TouchpressOptions = {
  minDuration?: number,
  minDistance?: number,
  onStart?: TouchpressHook,
  onMove?: TouchpressHook,
  onCancel?: TouchpressHook,
  onEnd?: TouchpressHook,
}

export type TouchpressHook = (api: TouchpressHookApi) => any

export type TouchpressHookApi = HookApi<TouchpressType, TouchpressMetadata>

const defaultOptions: TouchpressOptions = {
  minDuration: 0,
  minDistance: 0,
}

export function createTouchpress (options: TouchpressOptions = {}): RecognizeableOptions<TouchpressType, TouchpressMetadata>['effects'] {
  const {
          minDuration,
          minDistance,
          onStart,
          onCancel,
          onMove,
          onEnd,
        } = { ...defaultOptions, ...options },
        cleanup = () => {
          window.cancelAnimationFrame(request)
        }
  
  let request: number
  let totalTouches = 0

  const touchstart: RecognizeableEffect<'touchstart', TouchpressMetadata> = (event, api) => {
    const { denied } = api

    totalTouches++

    if (totalTouches > 1) {
      cleanup()
      denied()
      onStart?.(toHookApi(api))
      return
    }

    storePointerStartMetadata(event, api)
    storePointerMoveMetadata(event, api)
    storePointerTimeMetadata(
      event,
      api,
      () => totalTouches === 1,
      newRequest => request = newRequest,
      // @ts-expect-error
      recognize,
    )

    onStart?.(toHookApi(api))
  }

  const touchmove: RecognizeableEffect<'touchmove', TouchpressMetadata> = (event, api) => {
    const { getStatus } = api

    if (getStatus() !== 'denied') {
      storePointerMoveMetadata(event, api)
      // @ts-expect-error
      recognize(event, api)
    }

    onMove?.(toHookApi(api))
  }

  const recognize: RecognizeableEffect<'touchstart' | 'touchmove', TouchpressMetadata> = (event, api) => {
    const { getMetadata, recognized } = api,
          metadata = getMetadata()

    if (
      metadata.duration >= minDuration
      && metadata.distance.straight.fromStart >= minDistance
    ) {
      recognized()
    }
  }

  const touchcancel: RecognizeableEffect<'touchcancel', TouchpressMetadata> = (event, api) => {
    const { denied } = api

    cleanup()
    denied()
    totalTouches--
    
    onCancel?.(toHookApi(api))
  }

  const touchend: RecognizeableEffect<'touchend', TouchpressMetadata> = (event, api) => {
    const { denied } = api

    cleanup()
    denied()
    totalTouches--
    
    onEnd?.(toHookApi(api))
  }

  return {
    touchstart,
    touchmove,
    touchcancel,
    touchend,
  }
}

export class Touchpress extends Listenable<TouchpressType, TouchpressMetadata> {
  constructor (options?: TouchpressOptions) {
    super(
      'recognizeable' as TouchpressType,
      {
        recognizeable: {
          effects: createTouchpress(options),
        },
      }
    )
  }

  get metadata () {
    return this.recognizeable.metadata
  }
}
