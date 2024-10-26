import type { RecognizeableEffect } from '../classes'
import { createClone } from '../pipes/any'
import { toPointerPoint, toTouchMovePoint } from './toPoints'

export type PointerStartMetadata = {
  points: {
    start: { x: number, y: number },
    end: { x: number, y: number },
  }
}

const initialMetadata: PointerStartMetadata = {
  points: {
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
  },
}

export function storePointerStartMetadata<
  Type extends 'mousedown' | 'touchstart' | 'mouseover' | 'pointerdown' | 'pointerover',
  Metadata extends PointerStartMetadata
> ({ event, api }: {
  event: MouseEvent | TouchEvent,
  api: Parameters<RecognizeableEffect<Type, Metadata>>[1]
}): void {
  const { getMetadata } = api,
        metadata = getMetadata()

  const point = (event instanceof MouseEvent || event instanceof PointerEvent)
    ? toPointerPoint(event)
    : toTouchMovePoint(event)

  if (!metadata.points) metadata.points = createClone<typeof metadata.points>()(initialMetadata.points)
  metadata.points.start = point
  metadata.points.end = point
}
