/*
 * Recognizable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

// TODO: figure out if touch action CSS stuff is necessary

/* Utils */
import { toMouseEquivalent } from '../functions'

export default class Touch {
  constructor (options = {}) {
    this._onReset = options.onReset
    this._onStart = options.onStart
    this._onMove = options.onMove
    this._onCancel = options.onCancel
    this._onEnd = options.onEnd

    this._reset(true)
  }

  get events () {
    return this._computedEvents
  }
  get lastEvent () {
    return this.events[this.events.length - 1]
  }
  get recognized () {
    return this._computedRecognized
  }
  get metadata () {
    return this._computedMetadata
  }

  handle (event) {
    if (!this._recognizesConsecutive && this.recognized) {
      this._reset()
    }

    this._computedEvents.push(event)

    const { type } = event
    switch (true) {
    case (type === 'touchstart') || type === toMouseEquivalent('touchstart'):
      this._handleStart()
      break
    case (type === 'touchmove') || type === toMouseEquivalent('touchmove'):
      this._handleMove()
      break
    case (type === 'touchcancel') || type === toMouseEquivalent('touchcancel'):
      this._handleCancel()
      break
    case (type === 'touchend') || type === toMouseEquivalent('touchend'):
      this._handleEnd()
      break
    }

    return this.recognized
  }
  _reset = function(constructing) {
    this._computedEvents = []
    this._computedMetadata = {}
    this._computedRecognized = false
    if (!constructing) {
      this._onReset()
    }
  }
}
