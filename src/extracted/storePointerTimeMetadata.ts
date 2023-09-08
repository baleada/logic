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
  const { getSequence, getMetadata, getStatus, onRecognized } = api,
        metadata = getMetadata()

  if (!metadata.times) {
    metadata.times = createClone<typeof metadata.times>()(initialMetadata.times)
  }

  metadata.times.start = Math.round(event.timeStamp)
  metadata.times.end = Math.round(event.timeStamp)

  let previousTime = metadata.times.start
  const storeDuration = () => {
    const request = requestAnimationFrame(timestamp => {
      if (getShouldStore()) {
        previousTime = metadata.times.end
        metadata.times.end = Math.round(timestamp)
        metadata.duration = Math.max(0, metadata.times.end - metadata.times.start)
        const durationFromPrevious = Math.max(0, metadata.times.end - previousTime)
        metadata.velocity = metadata.distance.straight.fromPrevious / durationFromPrevious
        
        const event = getSequence().at(-1)

        recognize?.(event, api)
        if (getStatus() === 'recognized') onRecognized(event)

        storeDuration()
      }
    })

    setRequest(request)
  }
  
  storeDuration()
}
