export type NavigateableOptions = { initialLocation?: number }

export type NavigateableStatus = 'ready' | 'navigated'

const defaultOptions: NavigateableOptions = {
  initialLocation: 0,
}

const defaultNextAndPreviousOptions: { distance?: number, loops?: boolean } = {
  distance: 1,
  loops: true,
}

export class Navigateable<Item> {
  constructor (array: Item[], options: NavigateableOptions = {}) {
    this.setArray(array)
    this.navigate(options?.initialLocation ?? defaultOptions.initialLocation)
    this.ready()
  }
  
  private computedStatus: NavigateableStatus
  private ready () {
    this.computedStatus = 'ready'
  }

  private computedArray: Item[]
  get array () {
    return this.computedArray
  }
  set array (value) {
    this.setArray(value)
  }
  private computedLocation: number
  get location () {
    return this.computedLocation
  }
  set location (location) {
    this.setLocation(location)
  }
  get status () {
    return this.computedStatus
  }
  get item () {
    return this.array[this.location]
  }

  setArray (array: Item[]) {
    this.computedArray = array
    return this
  }

  setLocation (location: number) {
    this.navigate(location)

    return this
  }

  navigate (location: number) {
    const ensuredLocation = location < 0
      ? 0
      : location > this.array.length - 1
        ? this.array.length - 1
        : location
      
    this.computedLocation = ensuredLocation

    this.navigated()

    return this
  }
  private navigated () {
    this.computedStatus = 'navigated'
  }

  next (options: { distance?: number, loops?: boolean } = {}) {
    const { distance, loops } = { ...defaultNextAndPreviousOptions, ...options },
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

  previous (options: { distance?: number, loops?: boolean } = {}) {
    const { distance, loops } = { ...defaultNextAndPreviousOptions, ...options },
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
