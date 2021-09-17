import { getStroke } from 'perfect-freehand'
import type { StrokeOptions } from 'perfect-freehand'
import { createReduce } from '../pipes'

export type DrawableOptions = {
  toPath?: (stroke: ReturnType<typeof getStroke>) => string
}

type DrawableStatus = 'ready' | 'drawing' | 'drawn'

const defaultOptions: DrawableOptions = {
  toPath: stroke => stroke.length === 0
    ? ''
    : createReduce<number[], string>((d, [x0, y0], index) => {
      const [x1, y1] = stroke[(index + 1) % stroke.length]
      return `${d} ${x0} ${y0} ${(x0 + x1) / 2} ${(y0 + y1) / 2}${index === stroke.length - 1 ? ' Z': ''}`
    }, `M ${stroke[0][0]} ${stroke[0][1]} Q`)(stroke)
}

export class Drawable {
  private computedPath: string
  private toPath: DrawableOptions['toPath']
  constructor (stroke: ReturnType<typeof getStroke>, options: DrawableOptions = {}) {
    this.toPath = options?.toPath || defaultOptions.toPath
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

  get path () {
    return this.computedPath
  }
  
  private computedStroke: ReturnType<typeof getStroke>
  setStroke (stroke: ReturnType<typeof getStroke>) {
    this.computedStroke = stroke
    this.computedPath = this.toPath(stroke)
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
