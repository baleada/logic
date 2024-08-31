import { Listenable } from '../classes/Listenable'
import type { RecognizeableEffect } from '../classes'
import { toHookApi, storePointerStartMetadata, storePointerTimeMetadata, storePointerMoveMetadata } from '../extracted'
import type { PointerStartMetadata, PointerTimeMetadata, HookApi, PointerMoveMetadata } from '../extracted'

export type HoverType = 'mouseover' | 'mouseout' | 'touchstart'

export type HoverMetadata = (
  & PointerStartMetadata
  & PointerMoveMetadata
  & PointerTimeMetadata
)

export type HoverOptions = {
  minDuration?: number,
  onOver?: HoverHook,
  onOut?: HoverHook,
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
          onOver,
          onOut,
        } = { ...defaultOptions, ...options },
        stop = () => {
          window.cancelAnimationFrame(request)
        }

  let request: number
  let mouseStatus: 'entered' | 'exited' = 'exited'

  const mouseover: RecognizeableEffect<'mouseover', HoverMetadata> = (event, api) => {
    if (mouseStatus === 'exited') {
      mouseStatus = 'entered'

      storePointerStartMetadata({ event, api })
      storePointerMoveMetadata({ event, api })
      storePointerTimeMetadata({
        event,
        api,
        getShouldStore: () => mouseStatus === 'entered',
        setRequest: newRequest => request = newRequest,
        // @ts-expect-error
        recognize,
      })

      onOver?.(toHookApi(api))
      return
    }

    storePointerMoveMetadata({ event, api })
    onOver?.(toHookApi(api))
  }

  const recognize: RecognizeableEffect<'mouseover', HoverMetadata> = (event, api) => {
    const { getMetadata, recognized } = api,
          metadata = getMetadata()

    if (metadata.duration >= minDuration) {
      recognized()
    }
  }

  const mouseout: RecognizeableEffect<'mouseout', HoverMetadata> = (event, api) => {
    const { denied, listenInjection: { optionsByType: { mouseout: { target } } } } = api

    if (
      event.target !== target
      && (target as Element | Document).contains?.(event.relatedTarget as Node)
    ) {
      onOut?.(toHookApi(api))
      return
    }

    if (mouseStatus === 'entered') {
      denied()
      stop()
      mouseStatus = 'exited'
    }

    onOut?.(toHookApi(api))
  }

  const touchstart: RecognizeableEffect<'touchstart', HoverMetadata> = event => {
    event.preventDefault()
  }

  return {
    mouseover: {
      effect: mouseover,
      stop,
    },
    mouseout,
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
