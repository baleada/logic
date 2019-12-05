/*
 * Handlable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */

/* Utils */
import { is, toPolarCoordinates } from '../util/functions'

/* Constants */
const getEvent = () => Event

export default class Handleable extends getEvent() {
  constructor (required, options = {}) {
    super(required.event)

    this._getStore = required.getStore

    this._handlerApi = {
      toPolarCoordinates
    }
  }

  /* Public methods */
  handle (optionalHandler) {
    this._requiredHandler(this._event, this._handlerApi)
    if (is.function(optionalHandler)) {
      optionalHandler(this._event, this._getStore(), this._handlerApi)
    }
    return this
  }

  /* Private methods */
}
