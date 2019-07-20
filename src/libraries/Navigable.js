/*
 * Navigable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

import is from '../utils/is'

/**
 * Navigable is a library that enriches an array by:
 * - Allowing it to store a index of the item that has been navigated to
 * - Giving it the methods necessary to navigate to a different item
 *
 * Navigable is written in vanilla JS with no dependencies. It powers <nuxt-link to="/docs/tools/composition-functions/useNavigable">`useNavigable`</nuxt-link>.
 */
class Navigable {
  /* Private properties */
  #loops
  #initialIndex
  #increment
  #decrement
  #onNavigate

  /**
   * Constructs a Navigable instance
   * @param {Array}  array          The array that will be made navigable
   * @param {Number}  [initialIndex=0] The default index
   * @param {Boolean} [loops=true]   `true` when the Navigable instance should loop around to the beginning of the array when it navigates past the last item and loop around to the end when it navigates before the first item. `false` when navigating past the last item or before the first item does not change the index.
   * @param {Number}  [increment=1]  The number of items that will be traversed when the navigable instance is stepping forward through the array
   * @param {Number}  [decrement=1]  The number of items that will be traversed when the navigable instance is stepping backward through the array
   * @param {Function}  onNavigate    A function that Navigable will call after navigating to a new item. `onNavigate` acceepts two parameters: the index (Number) of the item that has been navigated to, and the Navigable instance (Object).
   */
  constructor(array, options = {}) {
    /* Options */
    options = {
      initialIndex: 0,
      loops: true,
      increment: 1,
      decrement: 1,
      onNavigate: undefined,
      ...options
    }

    this.#initialIndex = options.initialIndex
    this.#loops = options.loops
    this.#increment = options.increment
    this.#decrement = options.decrement
    this.#onNavigate = options.onNavigate

    /* Public properties */
    /**
     * A shallow copy of the array passed to the Navigable constructor
     * @type {Array}
     */
    this.array = array
    /**
     *  The index of the item that has been navigated to
     * @type {Number}
     */
    this.index = this.#initialIndex
  }

  /* Public methods */
  /**
   * Sets the Navigable instance's array
   * @param {Array} array The new array
   * @return {Object}       The new Navigable instance
   */
  setArray(array) {
    this.array = array
    return this
  }
  /**
   * Sets a value for `index`
   * @param {Number} index The new index
   * @return {Object}       The Navigable instance
   */
  setIndex(index) {
    this.index = index
    return this
  }
  /**
   * Navigates to a specific item
   * @param  {Number} index The index of the item that should be navigated to
   * @return {Object}       The Navigable instance
   */
  goTo(index) {
    switch (true) {
      case (index > this.array.length):
        index = this.array.length
        // TODO: decide whether to show warnings or not
        // console.warn(`Cannot set index: ${index} is greater than ${this.array.length} (the array's length). Index has been set to the array's length instead.`)
        break
      case (index < 0):
        index = 0
        // TODO: decide whether to show warnings or not
        // console.warn(`Cannot set index: ${index} is less than 0. Index has been set to 0 instead.` )
        break
      default:
        index = index
    }

    return this.#navigate(index)
  }
  /**
   * Steps forward through the array, increasing `index` by `increment`
   * @return {Object}       The Navigable instance
   */
  next() {
    let index
    const lastIndex = this.array.length - 1

    if (this.index + this.#increment > lastIndex) {
      switch (true) {
        case (this.#loops):
          index = this.index + this.#increment
          while(index > lastIndex) {
            index -= this.array.length
          }
          break
        default:
          index = lastIndex
      }
    } else {
      index = this.index + this.#increment
    }

    return this.goTo(index)
  }
  /**
   * Steps backward through the array, decreasing `index` by `decrement`
   * @return {Object}       The Navigable instance
   */
  prev() {
    let index

    if (this.index - this.#decrement < 0) {
      switch (true) {
        case (this.#loops):
          index = this.index - this.#decrement
          while(index < 0) {
            index += this.array.length
          }
          break
        default:
          index = 0
      }
    } else {
      index = this.index - this.#decrement
    }

    return this.goTo(index)
  }

  /* Private methods */
  #navigate = function(index) {
    if (is.function(this.#onNavigate)) this.#onNavigate(index, this)
    return this
  }
}

export default Navigable
