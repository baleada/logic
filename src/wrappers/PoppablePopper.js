/* Dependencies */
import Popper from 'popper.js'

/* Util */

export default class Library {
  #reference
  #popper
  #dependency
  #popperInstance

  constructor ({ reference, popper }, options = {}) {
    /* Options */

    /* Public properties */
    this.#reference = reference
    this.#popper = popper

    /* Private properties */
    this.#dependency = Popper
    this.#popperInstance = this.#getPopperInstance(options)
  }

  /* Public getters */
  get manager () {
    return this.#popperInstance
  }

  /* Public methods */
  setProperCaseState (state) {
    this.state = state
    return this
  }
  update () {
    this.#popperInstance.update()
  }
  enableEventListeners () {
    this.#popperInstance.enableEventListeners()
  }
  disableEventListeners () {
    this.#popperInstance.disableEventListeners()
  }
  scheduleUpdate () {
    this.#popperInstance.scheduleUpdate()
  }
  destroy () {
    this.#popperInstance.destroy()
  }

  /* Private methods */
  #getPopperInstance = function(options) {
    return new this.#dependency(
      this.#reference,
      this.#popper,
      options
    )
  }
}
