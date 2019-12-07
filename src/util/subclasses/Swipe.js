import { Touch } from '../classes'
import { emit, toPolarCoordinates } from '../functions'

/*
 * Swipe is defined as a single touch that:
 * - starts at a given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 * - travels at a velocity of greater than 0px/ms (or a minimum velocity of your choice)
 * - does not cancel
 * - ends
 */
export default class Swipe extends Touch {
  constructor (options = {}) {
    options = {
      minDistance: 10, // TODO: research
      minVelocity: 0.5, // TODO: research
      ...options,
      onReset: () => this._onReset()
    }

    super(options)

    this._minDistance = options.minDistance
    this._minVelocity = options.minVelocity

    this._onReset()
  }

  _handleStart = function() {
    this._isSingleTouch = this.lastEvent.touches.length === 1
    this._computedMetadata.times.start = this.lastEvent.timeStamp
    this._computedMetadata.points.start = {
      x: this.lastEvent.touches.item(0).clientX,
      y: this.lastEvent.touches.item(0).clientY
    }
    emit(this._onStart, this)
  }
  _handleMove = function() {
    emit(this._onMove, this)
  }
  _handleCancel = function() {
    this._reset()
    emit(this._onCancel, this)
  }
  _handleEnd = function() {
    if (this._isSingleTouch) {
      const { x: xA, y: yA } = this.metadata.points.start,
            { clientX: xB, clientY: yB } = this.lastEvent.changedTouches.item(0),
            { distance, angle } = toPolarCoordinates({ xA, xB, yA, yB }),
            endPoint = { x: xB, y: yB },
            endTime = this.lastEvent.timeStamp

      this._computedMetadata.points.end = endPoint
      this._computedMetadata.times.end = endTime
      this._computedMetadata.distance = distance
      this._computedMetadata.angle = angle
      this._computedMetadata.velocity = distance / (this.metadata.times.end - this.metadata.times.start)
    }

    this._recognize()

    emit(this._onEnd, this)
  }
  _recognize = function() {
    switch (true) {
    case !this._isSingleTouch: // Guard against multiple touches
      this._reset()
      this._onReset()
      break
    default:
      this._computedRecognized = this.metadata.distance > this._minDistance && this.metadata.velocity > this._minVelocity
      break
    }
  }
  _onReset = function() {
    this._computedMetadata.points = {}
    this._computedMetadata.times = {}
    this._isSingleTouch = true
  }
}
