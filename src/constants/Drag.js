import Gesture from '@baleada/gesture'
import { emit, toPolarCoordinates } from '../util'

/*
 * Drag is defined as a single click that:
 * - starts at given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 * - does not mouseout or end
 */
export default class Drag extends Gesture {
  constructor (options = {}) {
    options = {
      minDistance: 5, // TODO: research
      ...options,
      recognizesConsecutive: true,
    }

    super(options)

    this._onDown = options.onDown
    this._onMove = options.onMove
    this._onOut = options.onOut
    this._onUp = options.onUp

    this._minDistance = options.minDistance
  }

  mousedown () {
    this._mouseIsDown = true
    this.metadata.times.start = this.lastEvent.timeStamp
    this.metadata.points.start = {
      x: this.lastEvent.clientX,
      y: this.lastEvent.clientY,
    }
    emit(this._onDown, this)
  }
  mousemove () {
    if (this._mouseIsDown) {
      const { x: xA, y: yA } = this.metadata.points.start,
            { clientX: xB, clientY: yB } = this.lastEvent,
            { distance, angle } = toPolarCoordinates({ xA, xB, yA, yB }),
            endPoint = { x: xB, y: yB },
            endTime = this.lastEvent.timeStamp

      this.metadata.points.end = endPoint
      this.metadata.times.end = endTime
      this.metadata.distance = distance
      this.metadata.angle = angle
      this.metadata.velocity = distance / (this.metadata.times.end - this.metadata.times.start)

      this._recognize()

      emit(this._onMove, this)
    } else {
      this.reset()
    }
  }
  _recognize = function() {
    this.recognized = this.metadata.distance > this._minDistance
  }
  mouseout () {
    if (this._mouseIsDown) {
      this.reset()
      emit(this._onOut, this)
    }
  }
  mouseup () {
    this._mouseIsDown = false
    this.reset()
    emit(this._onEnd, this)
  }
  onReset () {
    this.metadata.points = {}
    this.metadata.times = {}
    this._mouseIsDown = false
  }
}
