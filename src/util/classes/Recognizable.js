/*
 * Recognizable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Utils */
import { toMouseEquivalent } from '../functions'

export default class Recognizable {
  constructor (options = {}) {
    this._onStart = options.onStart
    this._onMove = options.onMove
    this._onCancel = options.onCancel
    this._onEnd = options.onEnd

    this._events = []
    this._computedMetadata = {}
    this._computedRecognized = false
  }
  get recognized () {
    return this._computedRecognized
  }
  get metadata () {
    return this._computedMetadata
  }

  handle (event) {
    this._events.push(event)

    const { type } = event
    switch (true) {
    case (type === 'touchstart') || type === toMouseEquivalent('touchstart'):
      this._handleStart(event)
      break
    case (type === 'touchmove') || type === toMouseEquivalent('touchmove'):
      this._handleMove(event)
      break
    case (type === 'touchcancel') || type === toMouseEquivalent('touchcancel'):
      this._handleCancel(event)
      break
    case (type === 'touchend') || type === toMouseEquivalent('touchend'):
      this._handleEnd(event)
      break
    }
  }
}
