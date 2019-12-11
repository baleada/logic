import Gesture from '@baleada/gesture'
import { emit, toPolarCoordinates } from '../util'

/*
 * DragDrop is defined as a single click that:
 * - starts at a given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 * - travels at a velocity of greater than 0px/ms (or a minimum velocity of your choice)
 * - does not mouseout
 * - ends
 */
export default class DragDrop extends Gesture {
  constructor (options = {}) {
    options = {
      minDistance: 10, // TODO: research
      minVelocity: 0.5, // TODO: research
      ...options,
    }

    super(options)

    this._onDown = options.onDown
    this._onMove = options.onMove
    this._onOut = options.onOut
    this._onUp = options.onUp

    this._minDistance = options.minDistance
    this._minVelocity = options.minVelocity
  }

  mousedown () {
    this._mouseIsDown = true
    this.metadata.times.start = this.lastEvent.timeStamp
    this.metadata.points.start = {
      x: this.lastEvent.clientX,
      y: this.lastEvent.clientY
    }
    emit(this._onDown, this)
  }
  mousemove () {
    if (this._mouseIsDown) {
      emit(this._onMove, this)
    } else {
      this.reset()
    }
  }
  mouseout () {
    if (this._mouseIsDown) {
      this.reset()
      emit(this._onOut, this)
    }
  }
  mouseup () {
    this._mouseIsDown = false
    const { x: xA, y: yA } = this.metadata.points.start, // TODO: less naive start point so that velocity is closer to reality
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

    emit(this._onUp, this)
  }
  _recognize = function() {
    this.recognized = this.metadata.distance > this._minDistance && this.metadata.velocity > this._minVelocity
  }
  onReset () {
    this.metadata.points = {}
    this.metadata.times = {}
    this._mouseIsDown = false
  }
}
