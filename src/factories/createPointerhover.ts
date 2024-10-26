import { Listenable } from '../classes/Listenable'
import type { RecognizeableEffect } from '../classes'
import { toHookApi, storePointerStartMetadata, storePointerTimeMetadata, storePointerMoveMetadata } from '../extracted'
import type { PointerStartMetadata, PointerTimeMetadata, HookApi, PointerMoveMetadata } from '../extracted'

export type PointerhoverType = 'pointerover' | 'pointerout'

export type PointerhoverMetadata = (
  & PointerStartMetadata
  & PointerMoveMetadata
  & PointerTimeMetadata
)

export type PointerhoverOptions = {
  minDuration?: number,
  onOver?: PointerhoverHook,
  onOut?: PointerhoverHook,
}

export type PointerhoverHook = (api: PointerhoverHookApi) => any

export type PointerhoverHookApi = HookApi<PointerhoverType, PointerhoverMetadata>

const defaultOptions: PointerhoverOptions = {
  minDuration: 0,
}

/**
 * [Docs](https://baleada.dev/docs/logic/factories/pointerhover)
 */
export function createPointerhover (options: PointerhoverOptions = {}) {
  const {
          minDuration,
          onOver,
          onOut,
        } = { ...defaultOptions, ...options },
        stop = () => {
          window.cancelAnimationFrame(request)
        }

  let request: number
  let pointerStatus: 'entered' | 'exited' = 'exited'

  const pointerover: RecognizeableEffect<'pointerover', PointerhoverMetadata> = (event, api) => {
    if (pointerStatus === 'exited') {
      pointerStatus = 'entered'

      storePointerStartMetadata({ event, api })
      storePointerMoveMetadata({ event, api })
      storePointerTimeMetadata({
        event,
        api,
        getShouldStore: () => pointerStatus === 'entered',
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

  const recognize: RecognizeableEffect<'pointerover', PointerhoverMetadata> = (event, api) => {
    const { getMetadata, recognized } = api,
          metadata = getMetadata()

    if (metadata.duration >= minDuration) {
      recognized()
    }
  }

  const pointerout: RecognizeableEffect<'pointerout', PointerhoverMetadata> = (event, api) => {
    const { denied, listenInjection: { optionsByType: { pointerout: { target } } } } = api

    if (
      event.target !== target
      && (target as Element | Document).contains?.(event.relatedTarget as Node)
    ) {
      onOut?.(toHookApi(api))
      return
    }

    if (pointerStatus === 'entered') {
      denied()
      stop()
      pointerStatus = 'exited'
    }

    onOut?.(toHookApi(api))
  }

  return {
    pointerover: {
      effect: pointerover,
      stop,
    },
    pointerout,
  }
}

export class Pointerhover extends Listenable<PointerhoverType, PointerhoverMetadata> {
  constructor (options?: PointerhoverOptions) {
    super(
      'recognizeable' as PointerhoverType,
      {
        recognizeable: {
          effects: createPointerhover(options),
        },
      }
    )
  }

  get metadata () {
    return this.recognizeable.metadata
  }
}
