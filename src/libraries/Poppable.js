/*
 * Poppable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */
import Dependency from '../wrappers/PoppablePopper'

/* Utils */

export default class Poppable {
  #dependencyOptions
  #dependency

  constructor ({ reference, popper }, options = {}) {
    /* Options */

    /* Public properties */
    this.reference = reference
    this.popper = popper

    /* Private properties */

    /* Dependency */
    this.#dependencyOptions = this.#getDependencyOptions(options)
    this.#dependency = new Dependency({ reference: this.reference, popper: this.popper }, this.#dependencyOptions)
  }

  /* Public getters */
  get manager () {
    return this.#dependency.manager
  }

  /* Public methods */
  setReference (reference) {
    this.reference = reference
    return this
  }
  setPopper (popper) {
    this.popper = popper
    return this
  }
  update () {
    this.#dependency.update()
  }
  enableEventListeners () {
    this.#dependency.enableEventListeners()
  }
  disableEventListeners () {
    this.#dependency.disableEventListeners()
  }
  scheduleUpdate () {
    this.#dependency.scheduleUpdate()
  }
  destroy () {
    this.#dependency.destroy()
  }

  /* Private methods */
  #getDependencyOptions = (options) => options
}
