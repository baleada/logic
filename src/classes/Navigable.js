/*
 * Navigable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

class Navigable {
  #loops
  #increment
  #decrement
  #computedLocation

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
  setArray (array) {
    this.array = array
    return this
  }
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
