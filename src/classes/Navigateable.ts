export type NavigateableOptions = { initialLocation?: number }

export type NavigateableStatus = 'ready'
  | 'navigated'
  | 'navigated to next'
  | 'navigated to previous'
  | 'navigated to random'
  | 'navigated to first'
  | 'navigated to last'

export type NavigateOptions = {
  allows?: 'possible' | 'any',
}

export type NextAndPreviousOptions = {
  distance?: number,
  loops?: boolean,
}

const defaultOptions: NavigateableOptions = {
  initialLocation: 0,
}

const defaultNavigateOptions: NavigateOptions = { allows: 'possible' }

const defaultNextAndPreviousOptions: NextAndPreviousOptions = {
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

  navigate (location: number, options: NavigateOptions = {}) {
    const { allows } = { ...defaultNavigateOptions, ...options }
    this._navigate(location, { allows })
    this.navigated()
    return this
  }
  private navigated () {
    this.computedStatus = 'navigated'
  }

  private _navigate (location: number, options: NavigateOptions = {}) {
    const { allows } = { ...defaultNavigateOptions, ...options }

    const ensuredLocation = (() => {
      if (allows === 'possible') {
        if (location < 0 && allows === 'possible') {
          return 0
        }
  
        if (location > this.array.length - 1) {
          return Math.max(this.array.length - 1, 0)
        }
      }

      return location
    })()
      
    this.computedLocation = ensuredLocation
  }

  next (options: NextAndPreviousOptions & NavigateOptions = {}) {
    const { distance, loops, allows } = { ...defaultNextAndPreviousOptions, ...defaultNavigateOptions, ...options },
          newLocation = (() => {
            if (allows === 'any') {
              return this.location + distance
            }

            const lastLocation = this.array.length - 1

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

    this._navigate(newLocation, { allows })
    this.nexted()

    return this
  }
  private nexted () {
    this.computedStatus = 'navigated to next'
  }

  previous (options: NextAndPreviousOptions & NavigateOptions = {}) {
    const { distance, loops, allows } = { ...defaultNextAndPreviousOptions, ...defaultNavigateOptions, ...options },
          newLocation = (() => {
            if (allows === 'any') {
              return this.location - distance
            }

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

    this._navigate(newLocation, { allows })
    this.previoused()

    return this
  }
  private previoused () {
    this.computedStatus = 'navigated to previous'
  }
  
  random () {
    const newLocation = Math.floor(Math.random() * (this.array.length))
    this._navigate(newLocation)
    this.randomed()
    return this
  }
  private randomed () {
    this.computedStatus = 'navigated to random'
  }

  first () {
    this._navigate(0)
    this.firsted()
    return this
  }
  private firsted () {
    this.computedStatus = 'navigated to first'
  }

  last () {
    this._navigate(this.array.length - 1)
    this.lasted()
    return this
  }
  private lasted () {
    this.computedStatus = 'navigated to last'
  }
}
