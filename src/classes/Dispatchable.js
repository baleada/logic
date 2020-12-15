/*
 * Dispatchable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

import { toEvent } from '../util'

import { uniqueable } from '../factories'

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

  dispatch (target, options) {
    const { keyDirection = 'down', init = {} } = options,
          event = toEvent(
            {
              combo: uniqueable(this.type.split('+')).unique().map(name => (name === '' ? '+' : name)),
              direction: keyDirection
            },
            init
          )
    this._computedCancelled = !(target || window).dispatchEvent(event)
    this._dispatched()
    return this
  }
  _dispatched () {
    this._computedStatus = 'dispatched'
  }
}
