/*
 * Recognizable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

// TODO: figure out if touch action CSS stuff is necessary

/* Utils */

export default class Recognizable {
  constructor (options = {}) {
    options = {
      recognizesConsecutive: false,
      ...options
    }
    
    this._recognizesConsecutive = options.recognizesConsecutive
    this._onReset = options.onReset

    this._reset(true)
  }

  get events () {
    return this._computedEvents
  }
  get lastEvent () {
    return this.events[this.events.length - 1]
  }

  handle (event) {
    if (!this._recognizesConsecutive && this.recognized) {
      this._reset()
    }

    this._computedEvents.push(event)

    const { type } = event
    this[type](event)
  }
  _reset = function(constructing) {
    this._computedEvents = []
    this.metadata = {}
    this.recognized = false
    if (!constructing) {
      this._onReset()
    }
  }
}
