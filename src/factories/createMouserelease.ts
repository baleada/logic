import { Listenable } from '../classes/Listenable'
import type {
  RecognizeableEffect,
  ListenEffectParam,
  RecognizeableStopTarget,
} from '../classes'
import { toHookApi, storePointerStartMetadata, storePointerMoveMetadata, storePointerTimeMetadata } from '../extracted'
import type { PointerStartMetadata, PointerMoveMetadata, PointerTimeMetadata, HookApi } from '../extracted'

export type MousereleaseType = 'mousedown' | 'mouseleave' | 'mouseup'

export type MousereleaseMetadata = PointerStartMetadata
  & PointerMoveMetadata
  & PointerTimeMetadata

export type MousereleaseOptions = {
  minDuration?: number,
  minDistance?: number,
  minVelocity?: number,
  onDown?: MousereleaseHook,
  onMove?: MousereleaseHook,
  onLeave?: MousereleaseHook,
  onUp?: MousereleaseHook,
}

export type MousereleaseHook = (api: MousereleaseHookApi) => any

export type MousereleaseHookApi = HookApi<MousereleaseType, MousereleaseMetadata>

const defaultOptions: MousereleaseOptions = {
  minDuration: 0,
  minDistance: 0,
  minVelocity: 0,
}

/**
 * [Docs](https://baleada.dev/docs/logic/factories/mouserelease)
 */
export function createMouserelease (options: MousereleaseOptions = {}) {
  const {
          minDuration,
          minDistance,
          minVelocity,
          onDown,
          onLeave,
          onMove,
          onUp,
        } = { ...defaultOptions, ...options },
        stop = (target: RecognizeableStopTarget<MousereleaseType>) => {
          window.cancelAnimationFrame(request)
          target.removeEventListener('mousemove', mousemoveEffect)
        }

  let request: number
  let mousemoveEffect: (event: ListenEffectParam<'mousemove'>) => void
  let mouseStatus: 'down' | 'up' | 'leave'

  const mousedown: RecognizeableEffect<'mousedown', MousereleaseMetadata> = (event, api) => {
    mouseStatus = 'down'
    // @ts-expect-error
    mousemoveEffect = event => mousemove(event, api)

    storePointerStartMetadata(event, api)
    storePointerMoveMetadata(event, api)
    storePointerTimeMetadata(
      event,
      api,
      () => mouseStatus === 'down',
      newRequest => request = newRequest,
    )

    const { listenInjection: { optionsByType: { mousedown: { target } } } } = api
    target.addEventListener('mousemove', mousemoveEffect)

    onDown?.(toHookApi(api))
  }

  const mousemove: RecognizeableEffect<'mousemove', MousereleaseMetadata> = (event, api) => {
    storePointerMoveMetadata(event, api)

    onMove?.(toHookApi(api))
  }

  const mouseleave: RecognizeableEffect<'mouseleave', MousereleaseMetadata> = (event, api) => {
    const { denied, listenInjection: { optionsByType: { mouseleave: { target } } } } = api

    if (mouseStatus === 'down') {
      denied()
      stop(target)
      mouseStatus = 'leave'
    }

    onLeave?.(toHookApi(api))
  }

  const mouseup: RecognizeableEffect<'mouseup', MousereleaseMetadata> = (event, api) => {
    if (mouseStatus !== 'down') return

    storePointerMoveMetadata(event, api)
    
    const { listenInjection: { optionsByType: { mouseup: { target } } } } = api
    stop(target)
    mouseStatus = 'up'
    
    recognize(event, api)
    
    onUp?.(toHookApi(api))
  }

  const recognize: RecognizeableEffect<'mouseup', MousereleaseMetadata> = (event, api) => {
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
    mousedown: {
      effect: mousedown,
      stop,
    },
    mouseleave,
    mouseup,
  }
}

export class Mouserelease extends Listenable<MousereleaseType, MousereleaseMetadata> {
  constructor (options?: MousereleaseOptions) {
    super(
      'recognizeable' as MousereleaseType,
      {
        recognizeable: {
          effects: createMouserelease(options),
        },
      }
    )
  }

  get metadata () {
    return this.recognizeable.metadata
  }
}
