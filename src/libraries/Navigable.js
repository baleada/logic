/*
 * navigable.js v1.0.0
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

class Navigable {
  #loops
  #startIndex
  #increment
  #decrement
  #onNavigate

  constructor(array, options) {
    this.array = array,

    // Merge options with defaults
    options = {
      loops: true,
      startIndex: 0,
      increment: 1,
      decrement: 1,
      ...options
    }

    this.#loops = options.loops
    this.#startIndex = options.startIndex
    this.#increment = options.increment
    this.#decrement = options.decrement
    this.#onNavigate = options.onNavigate

    this.currentIndex = this.#startIndex
  }

  setArray (array) {
    this.array = array
  }

  // Navigation behaviors
  goTo (newIndex) {
    if (newIndex > this.array.length) console.error(`Cannot set current index: ${newIndex} is greater than ${this.array.length} (the array's length).` )
    else if (newIndex < 0) console.error(`Cannot set current index: ${newIndex} is less than 0.` )
    else this.currentIndex = newIndex

    if (this.#onNavigate !== undefined) this.#onNavigate(this.currentIndex)
  }

  next () {
    let newIndex

    if (this.currentIndex + this.#increment > this.array.length - 1) {
      if (this.#loops) newIndex = 0
      else if (this.currentIndex !== this.array.length - 1) newIndex = this.array.length - 1
    } else newIndex = this.currentIndex + this.#increment

    this.goTo(newIndex)
  }

  prev () {
    let newIndex

    if (this.currentIndex - this.#decrement < 0) {
      if (this.#loops) newIndex = this.array.length - 1
      else if (this.currentIndex !== 0) newIndex = 0
    } else newIndex = this.currentIndex - this.#decrement

    this.goTo(newIndex)
  }
}

export default Navigable
