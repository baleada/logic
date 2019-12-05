import { Recognizable } from '../classes'
import { emit, toPolarCoordinates } from '../functions'

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

  _handleStart = function(event) {
    this._reset()
    this._isSingleTouch = event.touches.length === 1
    this._computedMetadata.startPoint = {
      x: event.touches.item(0).clientX,
      y: event.touches.item(0).clientY,
    }
    emit(this._onStart, event, this)
  }
  _handleMove = function(event) {
    this._recognize(event)
    emit(this._onMove, event, this)
  }
  _recognize = function(event) {
    switch (true) {
    case !this._isSingleTouch: // Guard against multiple touches
      this._reset()
      break
    default:
      const { x: xA, y: yA } = this.metadata.startPoint,
            { clientX: xB, clientY: yB } = event.touches.item(0),
            { distance, angle } = toPolarCoordinates({ xA, xB, yA, yB }),
            endPoint = { x: xB, y: yB }

      this._computedMetadata.endPoint = endPoint
      this._computedMetadata.distance = distance
      this._computedMetadata.angle = angle

      this._computedRecognized = this.metadata.distance > this._minDistance
      break
    }
  }
  _handleCancel = function(event) {
    this._reset()
    emit(this._onCancel, event, this)
  }
  _handleEnd = function(event) {
    /* do nothing */
    emit(this._onEnd, event, this)
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
