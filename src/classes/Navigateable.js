/*
 * Navigateable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

// Utils
import is from '../util/is'

const defaultOptions = {
  initialLocation: 0,
}

class Navigateable {
  constructor (array, options = {}) {
    this.setArray(array)
    this.navigate(is.defined(options.initialLocation) ? options.initialLocation : defaultOptions.initialLocation)
    this._ready()
  }
  _ready () {
    this._computedStatus = 'ready'
  }

  /* Public getters */
  get array () {
    return this._computedArray
  }
  set array (value) {
    this.setArray(value)
  }
  get location () {
    return this._computedLocation
  }
  set location (location) {
    this.setLocation(location)
  }
  get status () {
    return this._computedStatus
  }
  get item () {
    return this.array[this.location]
  }

  /* Public methods */
  setArray (array) {
    this._computedArray = array
    return this
  }

  setLocation (newLocation) {
    this.navigate(newLocation)

    return this
  }

  navigate (newLocation) {
    switch (true) {
    case (newLocation > this.array.length - 1):
      newLocation = this.array.length - 1
      // TODO: decide whether or not to show warnings
      // console.warn(`Cannot set new location: ${newLocation} is greater than ${this.array.length} (the array's length). Location has been set to the array's length instead.`)
      break
    case (newLocation < 0):
      newLocation = 0
      // TODO: decide whether or not to show warnings
      // console.warn(`Cannot set newLocation: ${newLocation} is less than 0. Location has been set to 0 instead.` )
      break
    }

    this._computedLocation = newLocation

    this._navigated()

    return this
  }
  _navigated () {
    this._computedStatus = 'navigated'
  }

  next (options = {}) {
    options = {
      distance: 1,
      loops: true,
      ...options,
    }

    const { distance, loops } = options

    let newLocation
    const lastLocation = this.array.length - 1

    if (this.location + distance > lastLocation) {
      switch (true) {
      case (loops):
        newLocation = this.location + distance
        while (newLocation > lastLocation) {
          newLocation -= this.array.length
        }
        break
      default:
        newLocation = lastLocation
      }
    } else {
      newLocation = this.location + distance
    }

    this.navigate(newLocation)

    return this
  }

  previous (options = {}) {
    options = {
      distance: 1,
      loops: true,
      ...options,
    }
    const { distance, loops } = options

    let newLocation

    if (this.location - distance < 0) {
      switch (true) {
      case (loops):
        newLocation = this.location - distance
        while (newLocation < 0) {
          newLocation += this.array.length
        }
        break
      default:
        newLocation = 0
      }
    } else {
      newLocation = this.location - distance
    }

    this.navigate(newLocation)

    return this
  }

  random () {
    const newLocation = Math.floor(Math.random() * (this.array.length))
    this.navigate(newLocation)

    return this
  }
}

export default Navigateable
