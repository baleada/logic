import { at } from 'lazy-collections'
import type { RecognizeableEffect } from '../classes'
import { createClone } from '../pipes/any'

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
> ({
  event,
  api,
  getTimeMetadata,
  getShouldStore,
  setRequest,
  recognize,
}: {
  event: KeyboardEvent,
  api: Parameters<RecognizeableEffect<Type, Metadata | { played: Metadata[] }>>[1],
  getTimeMetadata: () => Metadata,
  getShouldStore: () => boolean,
  setRequest: (request: number) => void,
  recognize?: RecognizeableEffect<
    'keydown' | 'keyup',
    KeyboardTimeMetadata
  >
}): void {
  if (!getShouldStore()) return

  const { getStatus, listenInjection: { effect } } = api,
        timeMetadata = getTimeMetadata()

  if (!timeMetadata.times) timeMetadata.times = createClone<KeyboardTimeMetadata['times']>()(initialMetadata.times)

  timeMetadata.times.start = Math.round(event.timeStamp)
  timeMetadata.times.end = Math.round(event.timeStamp)

  const frameEffect: FrameRequestCallback = timestamp => {
          timeMetadata.times.end = Math.round(timestamp)
          timeMetadata.duration = Math.max(0, timeMetadata.times.end - timeMetadata.times.start)

          if (recognize) {
            // @ts-expect-error
            recognize(event, api)
            // @ts-expect-error
            if (getStatus() === 'recognized') effect(event)
          }
        },
        storeDuration = () => {
          const sequence = api.getSequence()

          if (!document.body.contains(
            (at(-1)(sequence) as typeof sequence[number]).target as HTMLElement | SVGElement
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
