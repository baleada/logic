/*
 * Navigable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

// Utils
import callback from '../util/callback'

class Navigable {
  #loops
  #increment
  #decrement
  #onNavigate
  #onGoTo
  #onNext
  #onPrev

  constructor (array, options = {}) {
    /* Options */
    options = {
      initialLocation: 0,
      loops: true,
      increment: 1,
      decrement: 1,
      onNavigate: (newLocation, instance) => instance.setLocation(newLocation),
      ...options
    }

    this.#loops = options.loops
    this.#increment = options.increment
    this.#decrement = options.decrement
    this.#onNavigate = options.onNavigate
    this.#onGoTo = options.onGoTo
    this.#onNext = options.onNext
    this.#onPrev = options.onPrev

    /* Public properties */
    this.array = array
    this.location = options.initialLocation

    /* Private properties */

    /* Dependency */
  }

  /* Public getters */
  get item () {
    return this.array[this.location]
  }

  /* Public methods */
  setArray (array) {
    this.array = array
    return this
  }
  setLocation (location) {
    this.location = location
    return this
  }
  goTo (newLocation, navigateType) {
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

    navigateType = navigateType || 'goTo'

    return this.#navigate(newLocation, navigateType)
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

    return this.goTo(newLocation, 'next')
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

    return this.goTo(newLocation, 'prev')
  }

  /* Private methods */
  #navigate = function(newLocation, navigateType) {
    callback(this.#onNavigate, newLocation, this)

    switch (navigateType) {
    case 'goTo':
      callback(this.#onGoTo, newLocation, this)
      break
    case 'next':
      callback(this.#onNext, newLocation, this)
      break
    case 'prev':
      callback(this.#onPrev, newLocation, this)
      break
    }
    return this
  }
}

export default Navigable
