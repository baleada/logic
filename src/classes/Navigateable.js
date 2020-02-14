/*
 * Navigateable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

// Utils
import { typedEmit } from '../util'

class Navigateable {
  constructor (array, options = {}) {
    /* Options */
    options = {
      initialLocation: 0,
      onNavigate: (newLocation, instance) => instance.setLocation(newLocation),
      ...options
    }

    this._onNavigate = options.onNavigate
    this._onGoTo = options.onGoTo
    this._onNext = options.onNext
    this._onPrev = options.onPrev
    this._onRand = options.onRand

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
      // TODO: decide whether or not to show warnings
      // console.warn(`Cannot set new location: ${newLocation} is greater than ${this.array.length} (the array's length). Location has been set to the array's length instead.`)
      break
    case (newLocation < 0):
      newLocation = 0
      // TODO: decide whether or not to show warnings
      // console.warn(`Cannot set newLocation: ${newLocation} is less than 0. Location has been set to 0 instead.` )
      break
    }

    navigateType = navigateType || 'goTo'

    return this._navigate(newLocation, navigateType)
  }

  next (options = {}) {
    options = {
      increment: 1,
      loops: true,
      ...options,
    }

    const { increment, loops } = options

    let newLocation
    const lastLocation = this.array.length - 1

    if (this.location + increment > lastLocation) {
      switch (true) {
      case (loops):
        newLocation = this.location + increment
        while (newLocation > lastLocation) {
          newLocation -= this.array.length
        }
        break
      default:
        newLocation = lastLocation
      }
    } else {
      newLocation = this.location + increment
    }

    return this.goTo(newLocation, 'next')
  }

  prev (options = {}) {
    options = {
      decrement: 1,
      loops: true,
      ...options,
    }
    const { decrement, loops } = options

    let newLocation

    if (this.location - decrement < 0) {
      switch (true) {
      case (loops):
        newLocation = this.location - decrement
        while (newLocation < 0) {
          newLocation += this.array.length
        }
        break
      default:
        newLocation = 0
      }
    } else {
      newLocation = this.location - decrement
    }

    return this.goTo(newLocation, 'prev')
  }

  rand () {
    const newLocation = Math.floor(Math.random() * (this.array.length))
    return this.goTo(newLocation, 'rand')
  }

  _navigate = function(newLocation, type) {
    typedEmit(
      newLocation,
      type,
      this,
      this._onNavigate,
      [
        { type: 'goTo', emitter: this._onGoTo },
        { type: 'next', emitter: this._onNext },
        { type: 'prev', emitter: this._onPrev },
        { type: 'rand', emitter: this._onRand },
      ]
    )

    return this
  }
}

export default Navigateable
