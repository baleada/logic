/*
 * Recognizable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

// TODO: figure out if touch action CSS stuff is necessary

/* Utils */
import { toMouseEquivalent } from '../functions'

export default class Recognizable {
  constructor (options = {}) {
    this._onStart = options.onStart
    this._onMove = options.onMove
    this._onCancel = options.onCancel
    this._onEnd = options.onEnd

    this._computedEvent = {}
    this._computedMetadata = {}
    this._computedRecognized = false
  }

  get event () {
    return this._computedEvent
  }
  get recognized () {
    return this._computedRecognized
  }
  get metadata () {
    return this._computedMetadata
  }

  handle (event) {
    this._computedEvent = event

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
}
