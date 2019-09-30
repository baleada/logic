/*
 * Navigable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/**
 * Navigable is a library that enriches an array by:
 * - Allowing it to store a index of the item that has been navigated to
 * - Giving it the methods necessary to navigate to a different item
 *
 * Navigable is written in vanilla JS with no dependencies. It powers <nuxt-link to="/docs/tools/composition-functions/useNavigable">`useNavigable`</nuxt-link>.
 */
class Navigable {
  #loops
  #increment
  #decrement
  #computedLocation

  /**
   * Constructs a Navigable instance
   * @param {Array}  array          The array that will be made navigable
   * @param {Number}  [initialLocation=0] The default location
   * @param {Boolean} [loops=true]   `true` when the Navigable instance should loop around to the beginning of the array when it navigates past the last item and loop around to the end when it navigates before the first item. `false` when navigating past the last item or before the first item does not change the location.
   * @param {Number}  [increment=1]  The number of items that will be traversed when the navigable instance is stepping forward through the array
   * @param {Number}  [decrement=1]  The number of items that will be traversed when the navigable instance is stepping backward through the array
   * @param {Function}  onNavigate    A function that Navigable will call after navigating to a new item. `onNavigate` acceepts two parameters: the index-based location (Number) of the item that has been navigated to, and the Navigable instance (Object).
   */
  constructor (array, options = {}) {
    /* Options */
    options = {
      initialLocation: 0,
      loops: true,
      increment: 1,
      decrement: 1,
      ...options
    }

    this.#loops = options.loops
    this.#increment = options.increment
    this.#decrement = options.decrement

    /* Public properties */
    /**
     * A shallow copy of the array passed to the Navigable constructor
     * @type {Array}
     */
    this.array = array

    /* Private properties */
    this.#computedLocation = options.initialLocation

    /* Dependency */
  }

  /* Public getters */
  get location () {
    return this.#computedLocation
  }

  /* Public methods */
  /**
   * Sets the Navigable instance's array
   * @param {Array} array The new array
   * @return {Object}       The new Navigable instance
   */
  setArray (array) {
    this.array = array
    return this
  }
  /**
   * Navigates to a specific item
   * @param  {Number} newLocation The index-based location of the item that should be navigated to
   * @return {Object}       The Navigable instance
   */
  goTo (newLocation) {
    switch (true) {
    case (newLocation > this.array.length):
      newLocation = this.array.length
      // TODO: decide whether to show warnings or not
      // console.warn(`Cannot set new location: ${newLocation} is greater than ${this.array.length} (the array's length). Location has been set to the array's length instead.`)
      break
    case (newLocation < 0):
      newLocation = 0
      // TODO: decide whether to show warnings or not
      // console.warn(`Cannot set newLocation: ${newLocation} is less than 0. Location has been set to 0 instead.` )
      break
    }

    return this.#navigate(newLocation)
  }
  /**
   * Steps forward through the array, increasing `location` by `increment`
   * @return {Object}       The Navigable instance
   */
  next () {
    let newLocation
    const lastLocation = this.array.length - 1

    if (this.location + this.#increment > lastLocation) {
      switch (true) {
      case (this.#loops):
        newLocation = this.location + this.#increment
        while (newLocation > lastLocation) {
          newLocation -= this.array.length
        }
        break
      default:
        newLocation = lastLocation
      }
    } else {
      newLocation = this.location + this.#increment
    }

    return this.goTo(newLocation)
  }
  /**
   * Steps backward through the array, decreasing `location` by `decrement`
   * @return {Object}       The Navigable instance
   */
  prev () {
    let newLocation

    if (this.location - this.#decrement < 0) {
      switch (true) {
      case (this.#loops):
        newLocation = this.location - this.#decrement
        while (newLocation < 0) {
          newLocation += this.array.length
        }
        break
      default:
        newLocation = 0
      }
    } else {
      newLocation = this.location - this.#decrement
    }

    return this.goTo(newLocation)
  }

  /* Private methods */
  #navigate = function(newLocation) {
    this.#computedLocation = newLocation
    return this
  }
}

export default Navigable
