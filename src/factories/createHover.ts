import { Listenable } from '../classes/Listenable'
import type { RecognizeableEffect } from '../classes'
import { toHookApi, storePointerStartMetadata, storePointerTimeMetadata } from '../extracted'
import type { PointerStartMetadata, PointerTimeMetadata, HookApi } from '../extracted'
import {  } from '../classes/Recognizeable'

export type HoverType = 'mouseenter' | 'mouseleave' | 'touchstart'

export type HoverMetadata = (
  & PointerStartMetadata
  & PointerTimeMetadata<false>
)

export type HoverOptions = {
  minDuration?: number,
  onEnter?: HoverHook,
  onLeave?: HoverHook,
}

export type HoverHook = (api: HoverHookApi) => any

export type HoverHookApi = HookApi<HoverType, HoverMetadata>

const defaultOptions: HoverOptions = {
  minDuration: 0,
}

/**
 * [Docs](https://baleada.dev/docs/logic/factories/hover)
 */
export function createHover (options: HoverOptions = {}) {
  const {
          minDuration,
          onEnter,
          onLeave,
        } = { ...defaultOptions, ...options },
        stop = () => {
          window.cancelAnimationFrame(request)
        }

  let request: number
  let mouseStatus: 'entered' | 'exited'

  const mouseenter: RecognizeableEffect<'mouseenter', HoverMetadata> = (event, api) => {
    mouseStatus = 'entered'

    storePointerStartMetadata({ event, api })
    storePointerTimeMetadata({
      event,
      moves: false,
      api,
      getShouldStore: () => mouseStatus === 'entered',
      setRequest: newRequest => request = newRequest,
      // @ts-expect-error
      recognize,
    })

    onEnter?.(toHookApi(api))
  }

  const recognize: RecognizeableEffect<'mouseenter', HoverMetadata> = (event, api) => {
    const { getMetadata, recognized } = api,
          metadata = getMetadata()

    if (metadata.duration >= minDuration) {
      recognized()
    }
  }

  const mouseleave: RecognizeableEffect<'mouseleave', HoverMetadata> = (event, api) => {
    const { denied } = api

    if (mouseStatus === 'entered') {
      denied()
      mouseStatus = 'exited'
    }

    onLeave?.(toHookApi(api))
  }

  const touchstart: RecognizeableEffect<'touchstart', HoverMetadata> = event => {
    event.preventDefault()
  }

  return {
    mouseenter: {
      effect: mouseenter,
      stop,
    },
    mouseleave,
    touchstart,
  }
}

export class Hover extends Listenable<HoverType, HoverMetadata> {
  constructor (options?: HoverOptions) {
    super(
      'recognizeable' as HoverType,
      {
        recognizeable: {
          effects: createHover(options),
        },
      }
    )
  }

  get metadata () {
    return this.recognizeable.metadata
  }
}
