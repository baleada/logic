/*
 * Navigable.js v1.0.0
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

import assignEnumerables from '../utils/assignEnumerables'
import is from '../utils/is'

class Navigable {
  #loops
  #startIndex
  #increment
  #decrement
  #onNavigate

  /**
   * [constructor description]
   * @param {Array}  array          [description]
   * @param {Number}  [startIndex=0] [description]
   * @param {Boolean} [loops=true]   [description]
   * @param {Number}  [increment=1]  [description]
   * @param {Number}  [decrement=1]  [description]
   * @param {Function}  onNavigate     [description]
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
     * [array description]
     * @type {Array}
     */
    array = array
    /**
     * [currentIndex description]
     * @type {Number}
     */
    const currentIndex = this.#startIndex

    assignEnumerables(this, {
      array,
      currentIndex
    }, 'property')

    /* Public methods */
    /**
     * [setArray description]
     * @param {[type]} array [description]
     */
    function setArray(array) {
      this.array = array
      return this
    }
    /**
     * [setCurrentIndex description]
     * @param {Number} index [description]
     */
    function setCurrentIndex(newIndex) {
      this.currentIndex = newIndex
      return this
    }
    /**
     * [goTo description]
     * @param  {Number} newIndex [description]
     */
    function goTo(index) {
      let newIndex

      switch (true) {
        case (newIndex > this.array.length):
          newIndex = this.array.length
          // TODO: decide whether to show warnings or not
          // console.warn(`Cannot set current index: ${newIndex} is greater than ${this.array.length} (the array's length). Current index has been set to the array's length instead.`)
          break
        case (newIndex < 0):
          newIndex = 0
          // TODO: decide whether to show warnings or not
          // console.warn(`Cannot set current index: ${newIndex} is less than 0. Current index has been set to 0 instead.` )
          break
        default:
          newIndex = newIndex
      }

      return this.#navigate(newIndex)
    }
    /**
     * [next description]
     */
    function next() {
      let newIndex
      const lastIndex = this.array.length - 1

      if (this.currentIndex + this.#increment > lastIndex) {
        switch (true) {
          case (this.#loops):
            newIndex = this.currentIndex + this.#increment
            while(newIndex > lastIndex) {
              newIndex -= this.array.length
            }
            break
          default:
            newIndex = lastIndex
        }
      } else {
        newIndex = this.currentIndex + this.#increment
      }

      return this.goTo(newIndex)
    }
    /**
     * [prev description]
     */
    function prev() {
      let newIndex

      if (this.currentIndex - this.#decrement < 0) {
        switch (true) {
          case (this.#loops):
            newIndex = this.currentIndex - this.#decrement
            while(newIndex < 0) {
              newIndex += this.array.length
            }
            break
          default:
            newIndex = 0
        }
      } else {
        newIndex = this.currentIndex - this.#decrement
      }

      return this.goTo(newIndex)
    }

    assignEnumerables(this, {
      setArray,
      setCurrentIndex,
      goTo,
      next,
      prev
    }, 'method')
  }

  #navigate = function(newIndex) {
    if (is.function(this.#onNavigate)) this.#onNavigate(newIndex)
    return this
  }
}

export default Navigable
