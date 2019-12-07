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
      onReset: () => this._onReset()
    }

    super(options)

    this._minDistance = options.minDistance

    this._recognizesConsecutive = true

    this._onReset()
  }

  _handleStart = function() {
    this._isSingleTouch = this.lastEvent.touches.length === 1
    this._computedMetadata.times.start = this.lastEvent.timeStamp
    this._computedMetadata.points.start = {
      x: this.lastEvent.touches.item(0).clientX,
      y: this.lastEvent.touches.item(0).clientY,
    }
    emit(this._onStart, this)
  }
  _handleMove = function() {
    const { x: xA, y: yA } = this.metadata.points.start, // TODO: less naive start point so that velocity is closer to reality
          { clientX: xB, clientY: yB } = this.lastEvent.touches.item(0),
          { distance, angle } = toPolarCoordinates({ xA, xB, yA, yB }),
          endPoint = { x: xB, y: yB },
          endTime = this.lastEvent.timeStamp

    this._computedMetadata.points.end = endPoint
    this._computedMetadata.times.end = endTime
    this._computedMetadata.distance = distance
    this._computedMetadata.angle = angle
    this._computedMetadata.velocity = distance / (this.metadata.times.end - this.metadata.times.start)

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
    this._reset()
    emit(this._onEnd, this)
  }
  _onReset = function() {
    this._computedMetadata.points = {}
    this._computedMetadata.times = {}
    this._isSingleTouch = true
  }
}
