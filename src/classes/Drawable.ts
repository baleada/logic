import { getStroke } from 'perfect-freehand'
import type { StrokeOptions } from 'perfect-freehand'
import polygonClipping from 'polygon-clipping'
import { join, average } from 'lazy-collections'

export type DrawableStroke = ReturnType<typeof getStroke>

export type DrawableOptions = {
  toD?: (stroke: DrawableStroke) => string
}

export type DrawableStatus = 'ready' | 'drawing' | 'drawn'

const defaultOptions: DrawableOptions = {
  toD: stroke => stroke.length === 0
    ? ''
    : toD(stroke),
}

/**
 * [Docs](https://baleada.dev/docs/logic/classes/drawable)
 */
export class Drawable {
  private computedD: string
  private toD: DrawableOptions['toD']
  constructor (stroke: DrawableStroke, options: DrawableOptions = {}) {
    this.toD = options?.toD || defaultOptions.toD
    this.setStroke(stroke)
    this.ready()
  }

  computedStatus: DrawableStatus
  private ready () {
    this.computedStatus = 'ready'
  }

  get stroke () {
    return this.computedStroke
  }
  set stroke (stroke) {
    this.setStroke(stroke)
  }

  get status () {
    return this.computedStatus
  }

  get d () {
    return this.computedD
  }
  
  private computedStroke: DrawableStroke
  setStroke (stroke: DrawableStroke) {
    this.computedStroke = stroke
    this.computedD = this.toD(stroke)
    return this
  }

  draw (points: Parameters<typeof getStroke>[0], options?: StrokeOptions) {
    this.drawing()
    this.stroke = getStroke(points, options)
    this.drawn()
    return this
  }

  private drawing () {
    this.computedStatus = 'drawing'
  }
  
  private drawn () {
    this.computedStatus = 'drawn'
  }

}

// Adapted from https://github.com/steveruizok/perfect-freehand#rendering
export function toD (stroke: number[][]) {
  if (stroke.length < 4) return ''

  let a = stroke[0]
  let b = stroke[1]
  const c = stroke[2]

  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(2)},${b[1].toFixed(2)} ${average()([b[0], c[0]]).toFixed(2)},${average()([b[1], c[1]]).toFixed(2)} T`

  for (let i = 2; i < stroke.length - 1; i++) {
    a = stroke[i]
    b = stroke[i + 1]
    result += `${average()([a[0], b[0]]).toFixed(2)},${average()([a[1], b[1]]).toFixed(2)} `
  }

  return `${result}Z`
}

// Adapted from https://github.com/steveruizok/perfect-freehand#flattening
export function toFlattenedD (stroke: number[][]) {
  if (stroke.length === 0) return ''

  const faces = polygonClipping.union([stroke] as [number, number][][])

  const flattenedD: string[] = []

  for (const face of faces) {
    for (const ring of face) {
      flattenedD.push(toD(ring))
    }
  }

  return toSpaceSeparated(flattenedD) as string
}

const toSpaceSeparated = join(' ')
