/*
 * Touchable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */
import Dependency from '../wrappers/TouchableHammer'

/* Utils */

export default class Touchable {
  #dependencyOptions
  #dependency

  constructor (element, options = {}) {
    /* Options */

    /* Public properties */
    this.element = element

    /* Private properties */

    /* Dependency */
    this.#dependencyOptions = options
    this.#dependency = new Dependency(this.element, this.#dependencyOptions)
  }

  /* Public getters */
  get manager () {
    return this.#dependency.manager
  }

  /* Public methods */
  setElement (element) {
    this.element = element
    return this
  }
  on (touchType, listener) {
    this.#dependency.on(touchType, listener)
  }
  touch (touchType, data) {
    this.#dependency.touch(touchType, data)
  }
  destroy () {
    this.#dependency.destroy()
  }

  /* Private methods */
}
