/*
 * Dispatchable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

import { toEvent, toCombo } from '../util'

export default class Dispatchable {
  constructor (type, options = {}) {
    this.setType(type)
    this._ready()
  }
  _ready () {
    this._computedStatus = 'ready'
  }

  get type () {
    return this._computedType
  }
  set type (type) {
    this.setType(type)
  }
  get cancelled () {
    return this._computedCancelled
  }
  get status () {
    return this._computedStatus
  }

  setType (type) {
    this._computedType = type
    return this
  }

  dispatch (options = {}) {
    const { target = window, keyDirection = 'down', init = {} } = options,
          event = toEvent({ combo: toCombo(this.type), direction: keyDirection }, init)

    this._computedCancelled = !target.dispatchEvent(event)
    this._dispatched()

    return this
  }
  _dispatched () {
    this._computedStatus = 'dispatched'
  }
}
