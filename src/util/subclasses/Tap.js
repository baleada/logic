import { Recognizable } from '../classes'
import { emit } from '../functions'

/*
 * Tap is defined as a single touch that:
 * - starts at given point
 * - does not travel
 * - ends
 * - repeats 1 time (or a minimum number of your choice), with each tap ocurring less than or equal to 500ms (or a maximum interval of your choice) after the previous tap
 */
export class Tap extends Recognizable {
  constructor (options = {}) {
    super(options)

    options = {
      minTaps: 1,
      maxInterval: 500, // Via https://ux.stackexchange.com/questions/40364/what-is-the-expected-timeframe-of-a-double-click
      ...options
    }

    this._minTaps = options.minTaps
    this._maxInterval = options.maxInterval

    this._isSingleTouch = true
    this._didNotTravel = true
  }

  _handleStart = function() {
    if (this.recognized) {
      this._reset()
    }
    
    this._isSingleTouch = this.event.touches.length === 1

    emit(this._onStart, this)
  }
  _handleMove = function() {
    this._didNotTravel = false
    emit(this._onMove, this)
  }
  _handleCancel = function() {
    this._reset()
    emit(this._onCancel, this)
  }
  _handleEnd = function() {
    const interval = this._computedMetadata.endTimes.length === 0
      ? 0
      : this.event.timestamp - this._computedMetadata.endTimes[this._computedMetadata.endTimes - 1]

    this._computedMetadata.taps = 1
    this._computedMetadata.endTimes.push(this.event.timeStamp)
    this._computedMetadata.intervals.push(interval)
    this._computedMetadata.points.push({
      x: this.event.changedTouches.item(0).clientX,
      y: this.event.changedTouches.item(0).clientY
    })

    this._recognize()

    emit(this._onEnd, this)
  }
  _recognize = function() {
    const lastTapTime = this.metadata.endTimes[this.metadata.endTimes.length - 1],
          secondToLastTapTime = this.metadata.endTimes[this.metadata.endTimes.length - 2],
          interval = lastTapTime - secondToLastTapTime

    switch (true) {
    case !this._didNotTravel || !this._isSingleTouch: // Guard against travelling taps and multiple touches
      this._reset()
      break
    case this._minTaps === 1: // Shortcut for single taps
      this._computedRecognized = true
      break
    case interval > this._maxInterval: // Guard against taps with intervals that are too large
      const lastPoint = this.metadata.points[this.metadata.points.length - 1]
      this._reset()
      this._computedMetadata.taps = 1
      this._computedMetadata.endTimes.push(lastTapTime)
      this._computedMetadata.points.push(lastPoint)
      break
    default:
      this._computedRecognized = this.metadata.taps > this._minTaps && this.metadata.intervals.every(interval => interval <= this._maxInterval)
      break
    }
  }
  _reset = function() {
    this._computedMetadata.taps = 0
    this._computedMetadata.endTimes = []
    this._computedMetadata.intervals = []
    this._computedMetadata.points = []
    this.didNotTravel = true
    this.isSingleTouch = true
    this._computedRecognized = false
  }
}
