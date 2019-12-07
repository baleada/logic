import { Touch } from '../classes'
import { emit, toPolarCoordinates } from '../functions'

/*
 * Pan is defined as a single touch that:
 * - starts at given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 * - does not cancel or end
 */
export default class Pan extends Touch {
  constructor (options = {}) {
    options = {
      minDistance: 5, // TODO: research
      ...options,
      onReset: () => this._onReset(),
      recognizesConsecutive: true,
    }

    super(options)

    this._minDistance = options.minDistance

    this._onReset()
  }

  touchstart () {
    this._isSingleTouch = this.lastEvent.touches.length === 1
    this.metadata.times.start = this.lastEvent.timeStamp
    this.metadata.points.start = {
      x: this.lastEvent.touches.item(0).clientX,
      y: this.lastEvent.touches.item(0).clientY,
    }
    emit(this._onStart, this)
  }
  touchmove () {
    const { x: xA, y: yA } = this.metadata.points.start, // TODO: less naive start point so that velocity is closer to reality
          { clientX: xB, clientY: yB } = this.lastEvent.touches.item(0),
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
  }
  _recognize = function() {
    switch (true) {
    case !this._isSingleTouch: // Guard against multiple touches
      this._reset()
      break
    default:
      this.metadata = this.metadata.distance > this._minDistance
      break
    }
  }
  touchcancel () {
    this._reset()
    emit(this._onCancel, this)
  }
  touchend () {
    this._reset()
    emit(this._onEnd, this)
  }
  _onReset = function() {
    this.metadata.points = {}
    this.metadata.times = {}
    this._isSingleTouch = true
  }
}
