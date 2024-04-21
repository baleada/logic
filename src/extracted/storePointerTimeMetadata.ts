import { at } from 'lazy-collections'
import type { RecognizeableEffect } from '../classes'
import { createClone } from '../pipes/any'
import type { PointerMoveMetadata } from './storePointerMoveMetadata'

export type PointerTimeMetadata = {
  times: {
    start: number,
    end: number,
  },
  duration: number,
  velocity: number,
}

const initialMetadata: PointerTimeMetadata = {
  times: {
    start: 0,
    end: 0,
  },
  duration: 0,
  velocity: 0,
}

export function storePointerTimeMetadata<
  Type extends 'mousedown' | 'touchstart',
  Metadata extends PointerTimeMetadata & PointerMoveMetadata
> (
  event: MouseEvent | TouchEvent,
  api: Parameters<RecognizeableEffect<Type, Metadata>>[1],
  getShouldStore: () => boolean,
  setRequest: (request: number) => void,
  recognize?: RecognizeableEffect<
    'mousedown' | 'mousemove' | 'touchstart' | 'touchmove',
    PointerTimeMetadata & PointerMoveMetadata
  >,
): void {
  const { getSequence, getMetadata, getStatus, listenInjection: { effect } } = api,
        metadata = getMetadata()

  if (!metadata.times) {
    metadata.times = createClone<typeof metadata.times>()(initialMetadata.times)
  }

  metadata.times.start = Math.round(event.timeStamp)
  metadata.times.end = Math.round(event.timeStamp)

  let previousEndTime = metadata.times.start

  const frameEffect: FrameRequestCallback = timestamp => {
          previousEndTime = metadata.times.end
          metadata.times.end = Math.round(timestamp)
          metadata.duration = Math.max(0, metadata.times.end - metadata.times.start)
          const durationFromPrevious = Math.max(0, metadata.times.end - previousEndTime)
          metadata.velocity = (metadata.distance.straight.fromPrevious / durationFromPrevious) || 0

          const event = getSequence().at(-1)

          // @ts-expect-error
          recognize?.(event, api)
          if (getStatus() === 'recognized') effect(event)
        },
        storeDuration = () => {
          const sequence = api.getSequence()

          if (!document.contains(
            (at(-1)(sequence) as typeof sequence[number]).target as HTMLElement
          )) return

          const request = requestAnimationFrame(timestamp => {
            if (!getShouldStore()) return

            frameEffect(timestamp)
            storeDuration()
          })

          setRequest(request)
        }

  frameEffect(performance.now())
  storeDuration()
}
