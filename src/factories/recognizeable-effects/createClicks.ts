import type { ListenEffectParam, RecognizeableEffect, RecognizeableOptions } from '../../classes'
import { createClone } from '../../pipes'
import { toHookApi, toMousePoint, toPolarCoordinates } from '../../extracted'
import type { HookApi, PointerStartMetadata, PointerTimeMetadata } from '../../extracted'

/*
 * clicks is defined as a single mousedown/mouseup combination that:
 * - starts at a given point
 * - does not move beyond a maximum distance
 * - does not mouseleave
 * - ends
 * - repeats 1 time (or a minimum number of your choice), with each click
     ending less than or equal to 500ms (or a maximum interval of your choice)
     after the previous click ended
 */

export type ClicksTypes = 'mousedown' | 'mouseleave' | 'mouseup'

export type ClicksMetadata = {
  mouseStatus: 'down' | 'up' | 'leave',
  lastClick: Click,
  clicks: Click[],
}

type Click = {
  times: PointerTimeMetadata['times'],
  points: PointerStartMetadata['points'], 
  distance: number,
  interval: number
}

export type ClicksOptions = {
  minClicks?: number,
  maxInterval?: number,
  maxDistance?: number,
  getMousemoveTarget?: (event: MouseEvent) => HTMLElement,
  onDown?: ClicksHook,
  onMove?: ClicksHook,
  onLeave?: ClicksHook,
  onUp?: ClicksHook
}

export type ClicksHook = (api: ClicksHookApi) => any

export type ClicksHookApi = HookApi<ClicksTypes, ClicksMetadata>

const defaultOptions: ClicksOptions = {
  minClicks: 1,
  maxInterval: 500, // Via https://ux.stackexchange.com/questions/40364/what-is-the-expected-timeframe-of-a-double-click
  maxDistance: 5, // TODO: research standard maxDistance
  getMousemoveTarget: (event: MouseEvent) => event.target as HTMLElement,
}

const initialClick: Click = {
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

export function createClicks (options: ClicksOptions = {}): RecognizeableOptions<ClicksTypes, ClicksMetadata>['effects'] {
  const { minClicks, maxInterval, maxDistance, getMousemoveTarget, onDown, onMove, onLeave, onUp } = { ...defaultOptions, ...options },
        cache: { mousemoveEffect?: (event: ListenEffectParam<'mousemove'>) => void } = {}

  const mousedown: RecognizeableEffect<ClicksTypes, ClicksMetadata> = (event, api) => {
    const { getMetadata } = api,
          metadata = getMetadata()
    
    metadata.mouseStatus = 'down'
    
    if (!metadata.lastClick) {
      metadata.lastClick = createClone<typeof metadata.lastClick>()(initialClick)
    }

    metadata.lastClick.times.start = event.timeStamp
    metadata.lastClick.points.start = toMousePoint(event)

    cache.mousemoveEffect = event => mousemove(event, api)
    getMousemoveTarget(event).addEventListener('mousemove', cache.mousemoveEffect)

    onDown?.(toHookApi(api))
  }

  const mousemove: RecognizeableEffect<ClicksTypes, ClicksMetadata> = (event, api) => {
    onMove?.(toHookApi(api))
  }

  const mouseleave: RecognizeableEffect<ClicksTypes, ClicksMetadata> = (event, api) => {
    const { getMetadata, denied } = api,
          metadata = getMetadata()

    if (metadata.mouseStatus === 'down') {
      denied()
      metadata.mouseStatus = 'leave'
      getMousemoveTarget(event).removeEventListener('mousemove', cache.mousemoveEffect)
    }

    onLeave?.(toHookApi(api))
  }

  const mouseup: RecognizeableEffect<ClicksTypes, ClicksMetadata> = (event, api) => {
    const { getMetadata } = api,
          metadata = getMetadata()

    metadata.mouseStatus = 'up'

    const { x: xA, y: yA } = metadata.lastClick.points.start,
          { clientX: xB, clientY: yB } = event,
          { distance } = toPolarCoordinates({ xA, xB, yA, yB }),
          endPoint = { x: xB, y: yB },
          endTime = event.timeStamp

    metadata.lastClick.points.end = endPoint
    metadata.lastClick.times.end = endTime
    metadata.lastClick.distance = distance

    if (!metadata.clicks) {
      metadata.clicks = []
    }

    const interval = metadata.clicks.length === 0
      ? 0
      : endTime - metadata.clicks[metadata.clicks.length - 1].times.end

    metadata.lastClick.interval = interval

    const newClick = createClone<typeof metadata.lastClick>()(metadata.lastClick)
    metadata.clicks.push(newClick)

    recognize(event, api)

    getMousemoveTarget(event).removeEventListener('mousemove', cache.mousemoveEffect)

    onUp?.(toHookApi(api))
  }

  const recognize: RecognizeableEffect<ClicksTypes, ClicksMetadata> = (event, { getMetadata, denied, recognized }) => {
    const metadata = getMetadata()

    // Deny after clicks with intervals or movement distances that are too large
    if (metadata.lastClick.interval > maxInterval || metadata.lastClick.distance > maxDistance) {
      const lastClick = createClone<typeof metadata.lastClick>()(metadata.lastClick)
      denied()
      metadata.clicks = [lastClick]
      return
    }
    
    if (metadata.clicks.length >= minClicks) {
      recognized()
    }
  }

  return { mousedown, mouseleave, mouseup }
}
