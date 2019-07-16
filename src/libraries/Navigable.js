/*
 * Navigable.js v1.0.0
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

import assignEnumerables from '../utils/assignEnumerables'
import is from '../utils/is'

/**
 * Navigable is a library that enriches an array by:
 * - Allowing it to store a current index of the item that has been navigated to
 * - Giving it the methods necessary to navigate to a different item
 *
 * Navigable is written in vanilla JS with no dependencies. It powers <nuxt-link to="/docs/tools/composition-functions/useNavigable">`useNavigable`</nuxt-link>.
 */
class Navigable {
  #loops
  #startIndex
  #increment
  #decrement
  #onNavigate

  /**
   * [constructor description]
   * @param {Array}  array          The array that will be made navigable
   * @param {Number}  [startIndex=0] The default current index
   * @param {Boolean} [loops=true]   `true` when the Navigable instance should loop around to the beginning of the array when it navigates past the last item and loop around to the end when it navigates before the first item. `false` when navigating past the last item or before the first item does not change the current index.
   * @param {Number}  [increment=1]  The number of items that will be traversed when the navigable instance is stepping forward through the array
   * @param {Number}  [decrement=1]  The number of items that will be traversed when the navigable instance is stepping backward through the array
   * @param {Function}  onNavigate    A function that Navigable will call after navigating to a new item. `onNavigate` takes two parameters: the index (Number) of the item that has been navigated to, and the Navigable instance (Object).
   */
  constructor(array, {
    startIndex = 0,
    loops = true,
    increment = 1,
    decrement = 1,
    onNavigate
  }) {
    /* Options */
    this.#loops = loops
    this.#startIndex = startIndex
    this.#increment = increment
    this.#decrement = decrement
    this.#onNavigate = onNavigate

    /* Public properties */
    /**
     * A shallow copy of the `array` passed to the constructor
     * @type {Array}
     */
    array = array
    /**
     *  The index of the item that has been navigated to
     * @type {Number}
     */
    const currentIndex = this.#startIndex

    assignEnumerables(this, {
      array,
      currentIndex
    }, 'property')

    /* Public methods */
    /**
     * Sets a value for `array`
     * @param {Array} array The new array
     * @return {Object}       The Navigable instance
     */
    function setArray(array) {
      this.array = array
      return this
    }
    /**
     * Sets a value for `currentIndex`
     * @param {Number} index The new current index
     * @return {Object}       The Navigable instance
     */
    function setCurrentIndex(index) {
      this.currentIndex = index
      return this
    }
    /**
     * Navigates to a specific item
     * @param  {Number} index The index of the item that should be navigated to
     * @return {Object}       The Navigable instance
     */
    function goTo(index) {
      switch (true) {
        case (index > this.array.length):
          index = this.array.length
          // TODO: decide whether to show warnings or not
          // console.warn(`Cannot set current index: ${index} is greater than ${this.array.length} (the array's length). Current index has been set to the array's length instead.`)
          break
        case (index < 0):
          index = 0
          // TODO: decide whether to show warnings or not
          // console.warn(`Cannot set current index: ${index} is less than 0. Current index has been set to 0 instead.` )
          break
        default:
          index = index
      }

      return this.#navigate(index)
    }
    /**
     * Steps forward through the array, increasing `currentIndex` by `increment`
     * @return {Object}       The Navigable instance
     */
    function next() {
      let index
      const lastIndex = this.array.length - 1

      if (this.currentIndex + this.#increment > lastIndex) {
        switch (true) {
          case (this.#loops):
            index = this.currentIndex + this.#increment
            while(index > lastIndex) {
              index -= this.array.length
            }
            break
          default:
            index = lastIndex
        }
      } else {
        index = this.currentIndex + this.#increment
      }

      return this.goTo(index)
    }
    /**
     * Steps backward through the array, decreasing `currentIndex` by `decrement`
     * @return {Object}       The Navigable instance
     */
    function prev() {
      let index

      if (this.currentIndex - this.#decrement < 0) {
        switch (true) {
          case (this.#loops):
            index = this.currentIndex - this.#decrement
            while(index < 0) {
              index += this.array.length
            }
            break
          default:
            index = 0
        }
      } else {
        index = this.currentIndex - this.#decrement
      }

      return this.goTo(index)
    }

    assignEnumerables(this, {
      setArray,
      setCurrentIndex,
      goTo,
      next,
      prev
    }, 'method')
  }

  // Private methods
  #navigate = function(index) {
    if (is.function(this.#onNavigate)) this.#onNavigate(index, this)
    return this
  }
}

export default Navigable
