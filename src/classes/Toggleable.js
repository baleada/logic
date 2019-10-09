/*
 * Toggleable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */

/* Utils */
import callback from '../util/callback'

export default class Togglable {
  #onToggle
  #onTrue
  #onFalse

  constructor (boolean, options = {}) {
    /* Options */
    options = {
      onToggle: (newBoolean, instance) => instance.setBoolean(newBoolean),
      onTrue: (newBoolean, instance) => instance.setBoolean(newBoolean),
      onFalse: (newBoolean, instance) => instance.setBoolean(newBoolean),
      ...options
    }

    this.#onToggle = options.onToggle
    this.#onTrue = options.onTrue
    this.#onFalse = options.onFalse

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
    callback(this.#onToggle, !this.boolean, this)
    return this
  }
  true () {
    callback(this.#onTrue, true, this)
    return this
  }
  false () {
    callback(this.#onFalse, !false, this)
    return this
  }

  /* Private methods */
}
