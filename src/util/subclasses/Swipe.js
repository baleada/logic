import { Recognizable } from '../classes'
import { emit, toPolarCoordinates } from '../functions'

/*
 * Swipe is defined as a single touch that:
 * - starts at given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 * - travels at a velocity of greater than 0px/ms (or a minimum velocity of your choice)
 * - ends
 */
export class Swipe extends Recognizable {
  constructor (options = {}) {
    super(options)

    options = {
      minDistance: 0,
      minVelocity: 0,
      ...options
    }

    this._minDistance = options.minDistance
    this._minVelocity = options.minVelocity

    this._isSingleTouch = true
  }

  _handleStart = function() {
    this._reset()
    this._isSingleTouch = this.event.touches.length === 1
    this._computedMetadata.startTime = this.event.timeStamp
    this._computedMetadata.startPoint = {
      x: this.event.touches.item(0).clientX,
      y: this.event.touches.item(0).clientY
    }
    emit(this._onStart, this)
  }
  _handleMove = function() {
    if (this._isSingleTouch) {
      const { x: xA, y: yA } = this.metadata.startPoint,
            { clientX: xB, clientY: yB } = this.event.touches.item(0),
            { distance, angle } = toPolarCoordinates({ xA, xB, yA, yB }),
            endPoint = { x: xB, y: yB },
            endTime = this.event.timeStamp

      this._computedMetadata.endPoint = endPoint
      this._computedMetadata.endTime = endTime
      this._computedMetadata.distance = distance
      this._computedMetadata.angle = angle
      this._computedMetadata.velocity = distance / (this.metadata.endTime - this.metadata.startTime)
    }
    
    emit(this._onMove, this)
  }
  _handleCancel = function() {
    this._reset()
    emit(this._onCancel, this)
  }
  _handleEnd = function() {
    this._recognize()
    emit(this._onEnd, this)
  }
  _recognize = function() {
    switch (true) {
    case !this._isSingleTouch: // Guard against multiple touches
      this._reset()
      break
    default:
      this._computedRecognized = this.metadata.distance > this._minDistance && this.metadata.velocity > this._minVelocity
      break
    }
  }
  _reset = function() {
    [
      'startPoint',
      'endPoint',
      'startTime',
      'endTime',
      'distance',
      'angle',
      'velocity'
    ].forEach(property => (this._computedMetadata[property] = undefined))

    this._isSingleTouch = true

    this._computedRecognized = false
  }
}
