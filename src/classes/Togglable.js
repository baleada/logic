/*
 * Togglable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */

/* Utils */
import { emit } from '../util/functions'

export default class Togglable {
  // _onToggle
  // _onTrue
  // _onFalse

  constructor (boolean, options = {}) {
    /* Options */
    options = {
      onToggle: (newBoolean, instance) => instance.setBoolean(newBoolean),
      onTrue: (newBoolean, instance) => instance.setBoolean(newBoolean),
      onFalse: (newBoolean, instance) => instance.setBoolean(newBoolean),
      ...options
    }

    this._onToggle = options.onToggle
    this._onTrue = options.onTrue
    this._onFalse = options.onFalse

    /* Public properties */
    this.boolean = boolean

    /* Private properties */

    /* Dependency */
  }

  /* Public getters */

  /* Public methods */
  setBoolean (boolean) {
    this.boolean = boolean
    return this
  }
  toggle () {
    emit(this._onToggle, !this.boolean, this)
    return this
  }
  true () {
    emit(this._onTrue, true, this)
    return this
  }
  false () {
    emit(this._onFalse, false, this)
    return this
  }

  /* Private methods */
}
