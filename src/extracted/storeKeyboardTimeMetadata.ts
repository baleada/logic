import type { RecognizeableEffect } from '../classes'
import { createClone } from '../pipes'

export type KeyboardTimeMetadata = {
  times: {
    start: number,
    end: number,
  },
  duration: number,
}

const initialMetadata: KeyboardTimeMetadata = {
  times: {
    start: 0,
    end: 0,
  },
  duration: 0,
}

export function storeKeyboardTimeMetadata<
  Type extends 'keydown' | 'keyup',
  Metadata extends KeyboardTimeMetadata
> (
  event: KeyboardEvent,
  api: Parameters<RecognizeableEffect<Type, Metadata>>[1],
  getShouldStore: () => boolean,
  setRequest: (request: number) => void,
  recognize?: RecognizeableEffect<
    'keydown' | 'keyup',
    KeyboardTimeMetadata
  >
): void {
  if (!getShouldStore()) return

  const { getMetadata, getStatus, onRecognized } = api,
        metadata = getMetadata()

  if (!metadata.times) metadata.times = createClone<KeyboardTimeMetadata['times']>()(initialMetadata.times)

  metadata.times.start = Math.round(event.timeStamp)
  metadata.times.end = Math.round(event.timeStamp)

  const storeDuration = () => {
    const request = requestAnimationFrame(timestamp => {
      if (!getShouldStore()) return
      
      metadata.times.end = Math.round(timestamp)
      metadata.duration = Math.max(0, metadata.times.end - metadata.times.start)
      
      if (recognize) {
        recognize(event, api)
        // @ts-expect-error
        if (getStatus() === 'recognized') onRecognized(event)
      }

      storeDuration()
    })

    setRequest(request)
  }
  
  storeDuration()
}
