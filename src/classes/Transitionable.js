/*
* Transitionable.js
* (c) 2019-present Alex Vipond
* Released under the MIT license
*/

import { is } from '../util'

const defaultOptions = {
  isGetter: false,
}

export default class Transitionable {
  constructor (state, options = {}) {
    this._isGetter = is.defined(options.isGetter) ? options.isGetter : defaultOptions.isGetter

    this.setState(state)
    this._computedEntrances = 0
    this._computedExits = 0
    this._ready()
  }
  _ready () {
    this._computedStatus = 'ready'
  }

  get state () {
    return this._computedState()
  }
  set state (state) {
    this.setState(state)
  }
  get status () {
    return this._computedStatus
  }
  get transitions () {
    return this._computedTransitions
  }

  setState (state) {
    this._computedState = () => this._isGetter ? state() : state
    return this
  }

  transition () {
    const { prepare, transitioning, transitioned } = options

    prepare?.()
    this._transitioning()
    transitioning?.(this.state)
    this._transitioned()
    transitioned?.(this.state)

    this._computedTransitions += 1

    return this
  }
  _transitioning () {
    this._computedStatus = 'transitioning'
  }
  _transitioned () {
    this._computedStatus = 'transitioned'
  }
}
