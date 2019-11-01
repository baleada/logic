/*
 * Navigable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

// Utils
import typedEmit from '../util/typedEmit'

class Navigable {
  // _loops
  // _increment
  // _decrement
  // _onNavigate
  // _onGoTo
  // _onNext
  // _onPrev

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

    this._loops = options.loops
    this._increment = options.increment
    this._decrement = options.decrement
    this._onNavigate = options.onNavigate
    this._onGoTo = options.onGoTo
    this._onNext = options.onNext
    this._onPrev = options.onPrev

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

    return this._navigate(newLocation, navigateType)
  }
  next () {
    let newLocation
    const lastLocation = this.array.length - 1

    if (this.location + this._increment > lastLocation) {
      switch (true) {
      case (this._loops):
        newLocation = this.location + this._increment
        while (newLocation > lastLocation) {
          newLocation -= this.array.length
        }
        break
      default:
        newLocation = lastLocation
      }
    } else {
      newLocation = this.location + this._increment
    }

    return this.goTo(newLocation, 'next')
  }
  prev () {
    let newLocation

    if (this.location - this._decrement < 0) {
      switch (true) {
      case (this._loops):
        newLocation = this.location - this._decrement
        while (newLocation < 0) {
          newLocation += this.array.length
        }
        break
      default:
        newLocation = 0
      }
    } else {
      newLocation = this.location - this._decrement
    }

    return this.goTo(newLocation, 'prev')
  }

  /* Private methods */
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
      ]
    )

    return this
  }
}

export default Navigable
