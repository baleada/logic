/*
 * Poppable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */
import Dependency from '../wrappers/PoppablePopper'

/* Util */

export default class Poppable {
  // _dependencyOptions
  // _dependency

  constructor ({ reference, popper }, options = {}) {
    /* Options */

    /* Public properties */
    this.reference = reference
    this.popper = popper

    /* Private properties */

    /* Dependency */
    this._dependencyOptions = this._getDependencyOptions(options)
    this._dependency = new Dependency({ reference: this.reference, popper: this.popper }, this._dependencyOptions)
  }

  /* Public getters */
  get manager () {
    return this._dependency.manager
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
    this._dependency.update()
  }
  enableEventListeners () {
    this._dependency.enableEventListeners()
  }
  disableEventListeners () {
    this._dependency.disableEventListeners()
  }
  scheduleUpdate () {
    this._dependency.scheduleUpdate()
  }
  destroy () {
    this._dependency.destroy()
  }

  /* Private methods */
  _getDependencyOptions = (options) => options
}
