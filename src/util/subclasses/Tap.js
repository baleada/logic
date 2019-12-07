import { Touch } from '../classes'
import { emit, toPolarCoordinates } from '../functions'

/*
 * Tap is defined as a single touch that:
 * - starts at a given point
 * - does not move beyond a maximum distance
 * - does not cancel
 * - ends
 * - repeats 1 time (or a minimum number of your choice), with each tap ending less than or equal to 500ms (or a maximum interval of your choice) after the previous tap ended
 */

export default class Tap extends Touch {
  constructor (options = {}) {
    options = {
      minTaps: 1,
      maxInterval: 500, // Via https://ux.stackexchange.com/questions/40364/what-is-the-expected-timeframe-of-a-double-click
      maxDistance: 5, // TODO: research this
      ...options,
      onReset: () => this._onReset()
    }

    super(options)

    this._minTaps = options.minTaps
    this._maxInterval = options.maxInterval
    this._maxDistance = options.maxDistance

    this._onReset()
  }

  _handleStart = function() {
    this._isSingleTouch = this.lastEvent.touches.length === 1
    this._computedMetadata.lastTap.times.start = this.lastEvent.timeStamp
    this._computedMetadata.lastTap.points.start = {
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
      const { x: xA, y: yA } = this.metadata.lastTap.points.start,
            { clientX: xB, clientY: yB } = this.lastEvent.changedTouches.item(0),
            { distance } = toPolarCoordinates({ xA, xB, yA, yB }),
            endPoint = { x: xB, y: yB },
            endTime = this.lastEvent.timeStamp

      this._computedMetadata.lastTap.points.end = endPoint
      this._computedMetadata.lastTap.times.end = endTime
      this._computedMetadata.lastTap.distance = distance
      this._computedMetadata.lastTap.interval = this.metadata.taps.length === 0
        ? 0
        : endTime - this.metadata.taps[this.metadata.taps.length - 1].times.end

      const newTap = JSON.parse(JSON.stringify(this.metadata.lastTap)) // Simple deep copy (excludes methods, which this object doesn't have)
      this._computedMetadata.taps.push(newTap)
    }

    this._recognize()

    emit(this._onEnd, this)
  }
  _recognize = function() {
    switch (true) {
    case !this._isSingleTouch || this.metadata.lastTap.interval > this._maxInterval || this.metadata.lastTap.distance > this._maxDistance: // Reset after multiple touoches and after taps with intervals or movement distances that are too large
      const lastTap = this.metadata.lastTap
      this._reset()
      this._computedMetadata.taps.push(lastTap)
      break
    default:
      this._computedRecognized = this.metadata.taps.length >= this._minTaps
      break
    }
  }
  _onReset = function() {
    this._computedMetadata.taps = []
    this._computedMetadata.lastTap = { points: {}, times: {} }
    this.isSingleTouch = true
  }
}
