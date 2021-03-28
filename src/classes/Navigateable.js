/**
 * @type {NavigateableOptions}
 */
const defaultOptions = {
  initialLocation: 0,
}

/**
 * @type {Navigateable.Class}
 */
export class Navigateable {
  /**
   * @typedef {{ initialLocation?: number }} NavigateableOptions
   * @param {any[]} array 
   * @param {NavigateableOptions} [options]
   */
  constructor (array, options = {}) {
    this.setArray(array)
    this.navigate(options?.initialLocation || defaultOptions.initialLocation)
    this._ready()
  }
  _ready () {
    /**
     * @type {('ready' | 'navigated')}
     */
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

  /**
   * @param {any[]} array 
   */
  setArray (array) {
    this._computedArray = array
    return this
  }

  /**
   * @param {number} newLocation
   */
  setLocation (newLocation) {
    this.navigate(newLocation)

    return this
  }

  /**
   * @param {number} newLocation
   */
  navigate (newLocation) {
    const ensuredNewLocation = newLocation < 0
      ? 0 // WARNING: console.warn(`Cannot set newLocation: ${newLocation} is less than 0. Location has been set to 0 instead.` )
      : newLocation > this.array.length - 1
        ? this.array.length - 1 // WARNING: console.warn(`Cannot set new location: ${newLocation} is greater than ${this.array.length} (the array's length). Location has been set to the array's length instead.`)
        : newLocation
      
    this._computedLocation = ensuredNewLocation

    this._navigated()

    return this
  }
  _navigated () {
    this._computedStatus = 'navigated'
  }

  /**
   * @param {{ distance?: number, loops?: boolean }} [options]
   */
  next (options = {}) {
    options = {
      distance: 1,
      loops: true,
      ...options,
    }

    const { distance, loops } = options,
          lastLocation = this.array.length - 1,
          newLocation = (() => {
            if (this.location + distance <= lastLocation) {
              return this.location + distance
            }

            // Next location is now proven to be past the end of the array.

            if (!loops) {
              return lastLocation
            }

            return (() => {
              let newLocation = this.location + distance
              while (newLocation > lastLocation) {
                newLocation -= this.array.length
              }
              return newLocation
            })()
          })()

    this.navigate(newLocation)

    return this
  }

  /**
   * @param {{ distance?: number, loops?: boolean }} [options]
   */
  previous (options = {}) {
    options = {
      distance: 1,
      loops: true,
      ...options,
    }
    const { distance, loops } = options,
          newLocation = (() => {
            if (this.location - distance >= 0) {
              return this.location - distance
            }

            // Previous location is now proven to be less than 0.

            if (!loops) {
              return 0
            }

            return (() => {
              let newLocation = this.location - distance
              while (newLocation < 0) {
                newLocation += this.array.length
              }
              return newLocation
            })()
          })()

    this.navigate(newLocation)

    return this
  }
  
  random () {
    const newLocation = Math.floor(Math.random() * (this.array.length))
    this.navigate(newLocation)

    return this
  }

  first () {
    this.navigate(0)
    return this
  }

  last () {
    this.navigate(this.array.length - 1)
    return this
  }
}
