import { toHookApi, toTouchMovePoint, toPolarCoordinates } from '../../extracted'
import { createClone } from '../../pipes'
import type { HookApi, PointerStartMetadata, PointerTimeMetadata } from '../../extracted'
import type { RecognizeableEffect, RecognizeableOptions } from '../../classes'

/*
 * touches is defined as a single touch that:
 * - starts at a given point
 * - does not move beyond a maximum distance
 * - does not cancel
 * - ends
 * - repeats 1 time (or a minimum number of your choice), with each tap ending less than or equal to 500ms (or a maximum interval of your choice) after the previous tap ended
 */

export type TouchesType = 'touchstart' | 'touchcancel' | 'touchmove' | 'touchend'

export type TouchesMetadata = {
  touchTotal: number,
  lastTouch: Touch,
  touches: Touch[]
}

type Touch = {
  times: PointerTimeMetadata['times'],
  points: PointerStartMetadata['points'],
  distance: number,
  interval: number
}

export type TouchesOptions = {
  minTouches?: number,
  maxInterval?: number,
  maxDistance?: number,
  onStart?: TouchesHook,
  onMove?: TouchesHook,
  onCancel?: TouchesHook,
  onEnd?: TouchesHook
}

export type TouchesHook = (api: TouchesHookApi) => any

export type TouchesHookApi = HookApi<TouchesType, TouchesMetadata>

const defaultOptions: TouchesOptions = {
  minTouches: 1,
  maxInterval: 500, // Via https://ux.stackexchange.com/questions/40364/what-is-the-expected-timeframe-of-a-double-click
  maxDistance: 5, // TODO: research appropriate/accessible minDistance
}

const initialTouch: Touch = {
  times: {
    start: 0,
    end: 0,
  },
  points: {
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
  },
  distance: 0,
  interval: 0,
}

export function createTouches (options: TouchesOptions = {}): RecognizeableOptions<TouchesType, TouchesMetadata>['effects'] {
  const { minTouches, maxInterval, maxDistance, onStart, onMove, onCancel, onEnd } = { ...defaultOptions, ...options }

  const touchstart: RecognizeableEffect<'touchstart', TouchesMetadata> = (event, api) => {
    const { getMetadata } = api,
          metadata = getMetadata()

    metadata.touchTotal = event.touches.length

    if (!metadata.lastTouch) {
      metadata.lastTouch = createClone<typeof metadata.lastTouch>()(initialTouch)
    }

    metadata.lastTouch.times.start = event.timeStamp
    metadata.lastTouch.points.start = toTouchMovePoint(event)

    onStart?.(toHookApi(api))
  }

  const touchmove: RecognizeableEffect<'touchmove', TouchesMetadata> = (event, api) => {
    onMove?.(toHookApi(api))
  }

  const touchcancel: RecognizeableEffect<'touchcancel', TouchesMetadata> = (event, api) => {
    const { getMetadata, denied } = api,
          metadata = getMetadata()

    if (metadata.touchTotal === 1) {
      denied()
      metadata.touchTotal = metadata.touchTotal - 1 // TODO: is there a way to un-cancel a touch without triggering a touch start? If so, this touch total calc would be wrong.
    }

    onCancel?.(toHookApi(api))
  }

  const touchend: RecognizeableEffect<'touchend', TouchesMetadata> = (event, api) => {
    const { getMetadata, denied } = api,
          metadata = getMetadata()

    metadata.touchTotal = metadata.touchTotal - 1

    if (metadata.touchTotal === 0) {
      const { x: xA, y: yA } = metadata.lastTouch.points.start,
            { clientX: xB, clientY: yB } = event.changedTouches.item(0),
            { distance } = toPolarCoordinates({ xA, xB, yA, yB }),
            endPoint = { x: xB, y: yB },
            endTime = event.timeStamp

      metadata.lastTouch.points.end = endPoint
      metadata.lastTouch.times.end = endTime
      metadata.lastTouch.distance = distance

      if (!metadata.touches) {
        metadata.touches = []
      }

      const interval = metadata.touches.length === 0
        ? 0
        : endTime - metadata.touches[metadata.touches.length - 1].times.end
      metadata.lastTouch.interval = interval

      const newTap = createClone<typeof metadata.lastTouch>()(metadata.lastTouch)
      metadata.touches.push(newTap)

      recognize(event, api)
    } else {
      denied()
    }

    onEnd?.(toHookApi(api))
  }

  const recognize: RecognizeableEffect<'touchend', TouchesMetadata> = (event, api) => {
    const { getMetadata, denied, recognized } = api,
          metadata = getMetadata()

    // Deny after multiple touches and after touches with intervals or movement distances that are too large
    if (
      metadata.touchTotal > 1
      || metadata.lastTouch.interval > maxInterval
      || metadata.lastTouch.distance > maxDistance
    ) {
      const lastTouch = createClone<typeof metadata.lastTouch>()(initialTouch)
      denied()
      metadata.touches = [lastTouch]
      return
    }

    if (metadata.touches.length >= minTouches) {
      recognized()
    }
  }

  return { touchstart, touchmove, touchcancel, touchend }
}
