/*
 * Touchable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */

/* Utils */

export default class Touchable {
  constructor(element, options = {}) {
    /* Options */

    /* Public properties */
    this.element = element

    /* Private properties */

    /* Dependency */
    this.#dependencyOptions = thie.#getDependencyOptions(options)
    this.#dependency = new Dependency(this.element, this.#dependencyOptions)
  }

  /* Public getters */
  get manager() {
    return this.#dependency.manager
  }

  /* Public methods */
  setElement(element) {
    this.element = element
    return this
  }
  listen(touchType, listener) {
    this.#dependency.listen(touchType, listener)
  }
  touch(touchType, data) {
    this.#dependency.touch(touchType, data)
  }
  destroy() {
    this.#dependency.destroy()
  }

  /* Private methods */

}
