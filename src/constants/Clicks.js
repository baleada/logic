import Gesture from '@baleada/gesture'
import { emit, toPolarCoordinates } from '../functions'

/*
 * Clicks is defined as a single mouse that:
 * - starts at a given point
 * - does not move beyond a maximum distance
 * - does not cancel
 * - ends
 * - repeats 2 times (or a minimum number of your choice), with each click ending less than or equal to 500ms (or a maximum interval of your choice) after the previous click ended
 */

export default class Clicks extends Gesture {
  constructor (options = {}) {
    options = {
      minClicks: 1,
      maxInterval: 500, // Via https://ux.stackexchange.com/questions/40364/what-is-the-expected-timeframe-of-a-double-click
      maxDistance: 5, // TODO: research this
      ...options,
    }

    super(options)

    this._minClicks = options.minClicks
    this._maxInterval = options.maxInterval
    this._maxDistance = options.maxDistance
  }

  mousedown () {
    this._mouseIsDown = true
    this.metadata.lastClick.times.start = this.lastEvent.timeStamp
    this.metadata.lastClick.points.start = {
      x: this.lastEvent.clientX,
      y: this.lastEvent.clientY
    }

    emit(this._onDown, this)
  }
  mousemove () {
    if (this._mouseIsDown) {
      emit(this._onMove, this)
    }
  }
  mouseout () {
    if (this._mouseIsDown) {
      this.reset()
      emit(this._onOut, this)
    }
  }
  mouseup () {
    this._mouseIsDown = false
    const { x: xA, y: yA } = this.metadata.lastClick.points.start,
          { clientX: xB, clientY: yB } = this.lastEvent,
          { distance } = toPolarCoordinates({ xA, xB, yA, yB }),
          endPoint = { x: xB, y: yB },
          endTime = this.lastEvent.timeStamp

    this.metadata.lastClick.points.end = endPoint
    this.metadata.lastClick.times.end = endTime
    this.metadata.lastClick.distance = distance
    this.metadata.lastClick.interval = this.metadata.clicks.length === 0
      ? 0
      : endTime - this.metadata.clicks[this.metadata.clicks.length - 1].times.end

    const newClick = JSON.parse(JSON.stringify(this.metadata.lastClick)) // Simple deep copy (excludes methods, which this object doesn't have)
    this.metadata.clicks.push(newClick)

    this._recognize()

    emit(this._onUp, this)
  }
  _recognize = function() {
    switch (true) {
    case this.metadata.lastClick.interval > this._maxInterval || this.metadata.lastClick.distance > this._maxDistance: // Reset after multiple touoches and after clicks with intervals or movement distances that are too large
      const lastClick = JSON.parse(JSON.stringify(this.metadata.lastClick)) // Simple deep copy (excludes methods, which this object doesn't have)
      this.reset()
      this.metadata.clicks.push(lastClick)
      break
    default:
      this.recognized = this.metadata.clicks.length >= this._minClicks
      break
    }
  }
  onReset () {
    this.metadata.clicks = []
    this.metadata.lastClick = { points: {}, times: {} }
    this._mouseIsDown = false
  }
}
