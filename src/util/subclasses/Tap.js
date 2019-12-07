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

  touchstart () {
    this._isSingleTouch = this.lastEvent.touches.length === 1
    this.metadata.lastTap.times.start = this.lastEvent.timeStamp
    this.metadata.lastTap.points.start = {
      x: this.lastEvent.touches.item(0).clientX,
      y: this.lastEvent.touches.item(0).clientY
    }

    emit(this._onStart, this)
  }
  touchmove () {
    emit(this._onMove, this)
  }
  touchcancel () {
    this._reset()
    emit(this._onCancel, this)
  }
  touchend () {
    if (this._isSingleTouch) {
      const { x: xA, y: yA } = this.metadata.lastTap.points.start,
            { clientX: xB, clientY: yB } = this.lastEvent.changedTouches.item(0),
            { distance } = toPolarCoordinates({ xA, xB, yA, yB }),
            endPoint = { x: xB, y: yB },
            endTime = this.lastEvent.timeStamp

      this.metadata.lastTap.points.end = endPoint
      this.metadata.lastTap.times.end = endTime
      this.metadata.lastTap.distance = distance
      this.metadata.lastTap.interval = this.metadata.taps.length === 0
        ? 0
        : endTime - this.metadata.taps[this.metadata.taps.length - 1].times.end

      const newTap = JSON.parse(JSON.stringify(this.metadata.lastTap)) // Simple deep copy (excludes methods, which this object doesn't have)
      this.metadata.taps.push(newTap)
    }

    this._recognize()

    emit(this._onEnd, this)
  }
  _recognize = function() {
    switch (true) {
    case !this._isSingleTouch || this.metadata.lastTap.interval > this._maxInterval || this.metadata.lastTap.distance > this._maxDistance: // Reset after multiple touoches and after taps with intervals or movement distances that are too large
      const lastTap = this.metadata.lastTap
      this._reset()
      this.metadata.taps.push(lastTap)
      break
    default:
      this.metadata = this.metadata.taps.length >= this._minTaps
      break
    }
  }
  _onReset = function() {
    this.metadata.taps = []
    this.metadata.lastTap = { points: {}, times: {} }
    this.isSingleTouch = true
  }
}
