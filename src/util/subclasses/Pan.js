import { Recognizable } from '../classes'
import { emit, toPolarCoordinates } from '../functions'

/*
 * Pan is defined as a single touch that:
 * - starts at given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 */
export class Pan extends Recognizable {
  constructor (options = {}) {
    super(options)

    options = {
      minDistance: 0,
      ...options
    }

    this._minDistance = options.minDistance

    this._isSingleTouch = true
  }

  _handleStart = function() {
    this._reset()
    this._isSingleTouch = this.event.touches.length === 1
    this._computedMetadata.startPoint = {
      x: this.event.touches.item(0).clientX,
      y: this.event.touches.item(0).clientY,
    }
    emit(this._onStart, this)
  }
  _handleMove = function() {
    const { x: xA, y: yA } = this.metadata.startPoint,
          { clientX: xB, clientY: yB } = this.event.touches.item(0),
          { distance, angle } = toPolarCoordinates({ xA, xB, yA, yB }),
          endPoint = { x: xB, y: yB }

    this._computedMetadata.endPoint = endPoint
    this._computedMetadata.distance = distance
    this._computedMetadata.angle = angle

    this._recognize()
    
    emit(this._onMove, this)
  }
  _recognize = function() {
    switch (true) {
    case !this._isSingleTouch: // Guard against multiple touches
      this._reset()
      break
    default:
      this._computedRecognized = this.metadata.distance > this._minDistance
      break
    }
  }
  _handleCancel = function() {
    this._reset()
    emit(this._onCancel, this)
  }
  _handleEnd = function() {
    /* do nothing */
    emit(this._onEnd, this)
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
    ].forEach(datum => (this._computedMetadata[datum] = undefined))

    this._isSingleTouch = true

    this._computedRecognized = false
  }
}
