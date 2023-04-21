import { getStroke } from 'perfect-freehand'
import type { StrokeOptions } from 'perfect-freehand'
import polygonClipping from 'polygon-clipping'
import { createReduce } from '../pipes'

export type DrawableState = ReturnType<typeof getStroke>

export type DrawableOptions = {
  toD?: (stroke: DrawableState) => string
}

export type DrawableStatus = 'ready' | 'drawing' | 'drawn'

const defaultOptions: DrawableOptions = {
  toD: stroke => stroke.length === 0
    ? ''
    : toD(stroke),
}

export class Drawable {
  private computedD: string
  private toD: DrawableOptions['toD']
  constructor (stroke: DrawableState, options: DrawableOptions = {}) {
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
  
  private computedStroke: DrawableState
  setStroke (stroke: DrawableState) {
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

export function toD (stroke: number[][]) {
  return createReduce<number[], string>((d, [x0, y0], index) => {
    const [x1, y1] = stroke[(index + 1) % stroke.length]
    return `${d} ${x0} ${y0} ${(x0 + x1) / 2} ${(y0 + y1) / 2}`
  }, `M ${stroke[0][0]} ${stroke[0][1]} Q`)(stroke) + 'Z'
}

export function toFlattenedD (stroke: number[][]) {
  if (stroke.length === 0) {
    return ''
  }

  const multiPolygon = polygonClipping.union([stroke as [number, number][]])

  return createReduce<polygonClipping.Polygon, string>((dFromMultiPolygon, polygon) => {
    return dFromMultiPolygon + createReduce<polygonClipping.Ring, string>((dFromRing, points) => {
      return dFromRing + toD(points)
    }, '')(polygon)
  }, '')(multiPolygon)
}
