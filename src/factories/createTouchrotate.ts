import { Listenable } from '../classes/Listenable'
import type { RecognizeableEffect } from '../classes'
import { toHookApi, toPolarCoordinates } from '../extracted'
import type { HookApi, PointerStartMetadata, PointerTimeMetadata, PolarCoordinates } from '../extracted'

/*
 * Rotate is defined as two touches that:
 * - each start at a given point, forming a line with an angle and distance
 * - change the angle by more than 0 degrees (or a minimum rotation of your choice)
 */

export type TouchrotateType = 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel'

export type TouchrotateMetadata = {
  touches: [Touch, Touch],
  times: PointerTimeMetadata['times'],
  rotation: PolarCoordinates['angle'],
  angle: {
    start: PolarCoordinates['angle'],
    end: PolarCoordinates['angle'],
  },
  angularVelocity: {
    radians: number,
    degrees: number,
  }
}

type Touch = {
  points: PointerStartMetadata['points'],
}

export type TouchrotateOptions = {
  minRotation?: number,
  minRotationUnit?: 'degrees' | 'radians',
  onStart?: TouchrotateHook,
  onMove?: TouchrotateHook,
  onCancel?: TouchrotateHook,
  onEnd?: TouchrotateHook
}

export type TouchrotateHook = (api: TouchrotateHookApi) => any

export type TouchrotateHookApi = HookApi<TouchrotateType, TouchrotateMetadata>

const defaultOptions: TouchrotateOptions = {
  minRotation: 0,
  minRotationUnit: 'degrees',
}

export function createTouchrotate (options: TouchrotateOptions = {}) {
  const { minRotation, minRotationUnit, onStart, onMove, onCancel, onEnd } = { ...defaultOptions, ...options },
        cache: { identifiers?: [number, number] } = {}

  const touchstart: RecognizeableEffect<'touchstart', TouchrotateMetadata> = (event, api) => {
    const { getMetadata, denied } = api,
          metadata = getMetadata()

    if (event.touches.length !== 2) {
      denied()
      return
    }

    metadata.angularVelocity = { radians: 0, degrees: 0 }
    metadata.rotation = { radians: 0, degrees: 0 }
    metadata.times = { start: event.timeStamp, end: 0 }

    const touches = (() => {
      return event.touches.item(0).clientX <= event.touches.item(1).clientX
        ? [event.touches.item(0), event.touches.item(1)]
        : [event.touches.item(1), event.touches.item(0)]
    })()

    cache.identifiers = [touches[0].identifier, touches[1].identifier]

    metadata.touches = [
      {
        points: {
          start: { x: touches[0].clientX, y: touches[0].clientY },
          end: { x: 0, y: 0 },
        },
      },
      {
        points: {
          start: { x: touches[1].clientX, y: touches[1].clientY },
          end: { x: 0, y: 0 },
        },
      },
    ]

    metadata.angle = {
      start: toPolarCoordinates({
        xA: metadata.touches[0].points.start.x,
        xB: metadata.touches[1].points.start.x,
        yA: metadata.touches[0].points.start.y,
        yB: metadata.touches[1].points.start.y,
      }).angle,
      end: { radians: 0, degrees: 0 },
    }

    onStart?.(toHookApi(api))
  }

  const touchmove: RecognizeableEffect<'touchmove', TouchrotateMetadata> = (event, api) => {
    const { getMetadata } = api,
          metadata = getMetadata(),
          touches = (() => {
            return event.touches.item(0).identifier === cache.identifiers[0]
              ? [event.touches.item(0), event.touches.item(1)]
              : [event.touches.item(1), event.touches.item(0)]
          })()

    metadata.times.end = event.timeStamp

    metadata.touches[0].points.end = {
      x: touches[0].clientX,
      y: touches[0].clientY,
    }
    metadata.touches[1].points.end = {
      x: touches[1].clientX,
      y: touches[1].clientY,
    }

    metadata.angle.end = toPolarCoordinates({
      xA: metadata.touches[0].points.end.x,
      xB: metadata.touches[1].points.end.x,
      yA: metadata.touches[0].points.end.y,
      yB: metadata.touches[1].points.end.y,
    }).angle

    metadata.rotation.radians = metadata.angle.end.radians - metadata.angle.start.radians
    metadata.rotation.degrees = metadata.angle.end.degrees - metadata.angle.start.degrees

    metadata.angularVelocity.radians = metadata.rotation.radians / (metadata.times.end - metadata.times.start)
    metadata.angularVelocity.degrees = metadata.rotation.degrees / (metadata.times.end - metadata.times.start)

    recognize(event, api)

    onMove?.(toHookApi(api))
  }

  const touchcancel: RecognizeableEffect<'touchcancel', TouchrotateMetadata> = (event, api) => {
    const { denied } = api
    denied()

    // store end data

    onCancel?.(toHookApi(api))
  }

  const touchend: RecognizeableEffect<'touchend', TouchrotateMetadata> = (event, api) => {
    const { denied } = api
    denied()

    // store end data

    onEnd?.(toHookApi(api))
  }

  const recognize: RecognizeableEffect<'touchmove', TouchrotateMetadata> = (event, api) => {
    const { getMetadata, recognized } = api,
          metadata = getMetadata()

    if (Math.abs(metadata.rotation[minRotationUnit]) > minRotation) recognized()
  }

  return { touchstart, touchmove, touchcancel, touchend }
}

export class Touchrotate extends Listenable<TouchrotateType, TouchrotateMetadata> {
  constructor (options?: TouchrotateOptions) {
    super(
      'recognizeable' as TouchrotateType,
      {
        recognizeable: {
          effects: createTouchrotate(options),
        },
      }
    )
  }

  get metadata () {
    return this.recognizeable.metadata
  }
}
