/*
 * Dispatchable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

import { toEvent } from '../util'

import { uniqueable } from '../factories'

const defaultOptions = {
  keyDirection: 'down',
  // Can support custom delimiter if needed
  // delimiter: '+'
}

export default class Dispatchable {
  constructor (type, options = {}) {
    if (type === 'recognizeable') {
      
    }

    // Has no effect if the type is not detected as keycombo
    this._keyDirection = options.keyDirection ?? defaultOptions.keyDirection
    this._init = options.init ?? {}

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
  get status () {
    return this._computedStatus
  }
  get event () {
    return toEvent({ combo: this._combo, direction: this._keyDirection }, this._init)
  }

  setType (type) {
    this._computedType = type
    this._combo = uniqueable(type.split('+'))
      .unique()
      .map(name => (name === '' ? '+' : name))
    return this
  }

  dispatch (target) {
    (target || window).dispatchEvent(this.event)
    this._dispatched()
    return this
  }
  _dispatched () {
    this._computedStatus = 'dispatched'
  }
}
