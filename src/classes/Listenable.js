/*
 * Listenable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */

/* Utils */

export default class Listenable {
  #element
  #listener

  constructor (eventType, options = {}) {
    /* Options */
    options = {
      element: document,
      ...options
    }

    this.#element = options.element
    this.#listener = options.listener

    /* Public properties */
    this.eventType = eventType

    /* Private properties */

    /* Dependency */
  }

  /* Public getters */

  /* Public methods */
  setEventType (eventType) {
    this.destroy()
    this.eventType = eventType
    return this
  }
  listen () {
    this.#element.addEventListener(this.eventType, this.#listener)
    return this
  }
  destroy () {
    this.#element.removeEventListener(this.eventType, this.#listener)
    return this
  }

  /* Private methods */
}
