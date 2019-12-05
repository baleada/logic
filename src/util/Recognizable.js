/*
 * Recognizable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */

/* Utils */
import { is, withDirectionCondition, toPolarCoordinates, toDirection, toMouseEquivalents } from '../util'
import directions from './directions'

export default class Recognizable {
  constructor (event, options = {}) {
    /* Options */

    /* Public properties */
    this.event = event

    /* Private properties */
    this._listenerApi = {
      toDirection
    }
    this._handlerApi = {
      toPolarCoordinates
    }

    /* Dependency */
  }

  setEvent (event) {
    this.event = event
    return this
  }
  recognize ({ recognized, listener }) {
    if (recognized) {
      console.log({ recognized })
      listener(event, this._listenerApi)
    }
  }
  handle (requiredHandler, optionalHandler, store) {
    console.log({ handle: this._event })
    requiredHandler(this._event, this._handlerApi)
    if (is.function(optionalHandler)) {
      optionalHandler(this._event, store, this._handlerApi)
    }
  }
}
