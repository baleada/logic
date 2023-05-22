import type { RecognizeableEffect, RecognizeableOptions } from '../classes'
import { toHookApi, storePointerStartMetadata, storePointerMoveMetadata, storePointerTimeMetadata } from '../extracted'
import type { PointerStartMetadata, PointerMoveMetadata, PointerTimeMetadata, HookApi } from '../extracted'

/*
 * touchrelease is defined as a single touchstart that:
 * - starts at a given point
 * - travels a distance greater than or equal to 0px (or a minimum distance of your choice)
 * - travels at a velocity of greater than or equal to 0px/ms (or a minimum velocity of your choice)
 * - does not touchcancel or end before 0ms (or a minimum duration of your choice) has elapsed
 * - ends
 */

export type TouchreleaseTypes = 'touchstart' | 'touchmove' | 'touchcancel' | 'touchend'

export type TouchreleaseMetadata = PointerStartMetadata
  & PointerMoveMetadata
  & PointerTimeMetadata

export type TouchreleaseOptions = {
  minDuration?: number,
  minDistance?: number,
  minVelocity?: number,
  onStart?: TouchreleaseHook,
  onMove?: TouchreleaseHook,
  onCancel?: TouchreleaseHook,
  onEnd?: TouchreleaseHook,
}

export type TouchreleaseHook = (api: TouchreleaseHookApi) => any

export type TouchreleaseHookApi = HookApi<TouchreleaseTypes, TouchreleaseMetadata>

const defaultOptions: TouchreleaseOptions = {
  minDuration: 0,
  minDistance: 0,
  minVelocity: 0,
}

export function createTouchrelease (options: TouchreleaseOptions = {}): RecognizeableOptions<TouchreleaseTypes, TouchreleaseMetadata>['effects'] {
  const {
          minDuration,
          minDistance,
          minVelocity,
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

  const touchstart: RecognizeableEffect<'touchstart', TouchreleaseMetadata> = (event, api) => {
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
    )

    onStart?.(toHookApi(api))
  }

  const touchmove: RecognizeableEffect<'touchmove', TouchreleaseMetadata> = (event, api) => {
    const { getStatus } = api
    
    if (getStatus() !== 'denied') storePointerMoveMetadata(event, api)

    onMove?.(toHookApi(api))
  }

  const touchcancel: RecognizeableEffect<'touchcancel', TouchreleaseMetadata> = (event, api) => {
    const { denied } = api

    cleanup()
    denied()
    totalTouches--
    
    onCancel?.(toHookApi(api))
  }

  const touchend: RecognizeableEffect<'touchend', TouchreleaseMetadata> = (event, api) => {
    const { denied } = api

    if (totalTouches !== 1) {
      cleanup()
      denied()
      onEnd?.(toHookApi(api))
      return
    }

    storePointerMoveMetadata(event, api)
    
    cleanup()
    totalTouches--
    
    recognize(event, api)
    
    onEnd?.(toHookApi(api))
  }

  const recognize: RecognizeableEffect<'touchend', TouchreleaseMetadata> = (event, api) => {
    const { getMetadata, recognized, denied } = api,
          metadata = getMetadata()

    if (
      metadata.duration >= minDuration
      && metadata.distance.straight.fromStart >= minDistance
      && metadata.velocity >= minVelocity
    ) {
      recognized()
    } else {
      denied()
    }
  }

  return {
    touchstart,
    touchmove,
    touchcancel,
    touchend,
  }
}
