import Gesture from '@baleada/gesture'
import { emit, toPolarCoordinates } from '../functions'

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

    this._minDistance = options.minDistance
    this._minVelocity = options.minVelocity
  }

  touchstart () {
    this._isSingleTouch = this.lastEvent.touches.length === 1
    this.metadata.times.start = this.lastEvent.timeStamp
    this.metadata.points.start = {
      x: this.lastEvent.touches.item(0).clientX,
      y: this.lastEvent.touches.item(0).clientY
    }
    emit(this._onStart, this)
  }
  touchmove () {
    emit(this._onMove, this)
  }
  touchcancel () {
    this.reset()
    emit(this._onCancel, this)
  }
  touchend () {
    if (this._isSingleTouch) {
      const { x: xA, y: yA } = this.metadata.points.start,
            { clientX: xB, clientY: yB } = this.lastEvent.changedTouches.item(0),
            { distance, angle } = toPolarCoordinates({ xA, xB, yA, yB }),
            endPoint = { x: xB, y: yB },
            endTime = this.lastEvent.timeStamp

      this.metadata.points.end = endPoint
      this.metadata.times.end = endTime
      this.metadata.distance = distance
      this.metadata.angle = angle
      this.metadata.velocity = distance / (this.metadata.times.end - this.metadata.times.start)
    }

    this._recognize()

    emit(this._onEnd, this)
  }
  _recognize = function() {
    switch (true) {
    case !this._isSingleTouch: // Guard against multiple touches
      this.reset()
      this.onReset()
      break
    default:
      this.recognized = this.metadata.distance > this._minDistance && this.metadata.velocity > this._minVelocity
      break
    }
  }
  onReset () {
    this.metadata.points = {}
    this.metadata.times = {}
    this._isSingleTouch = true
  }
}
