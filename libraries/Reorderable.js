/*
 * reorderable.js v1.0.0
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

// Libraries

// Utils
import is from './is.js'

export default class Reorderable {
  #onReorder

  constructor (array, options) {
    this.array = array

    // options = {
    //   ...options
    // }

    this.#onReorder = options.onReorder
  }

  set reorderedArray (newArray) {
    if (is.function(this.#onReorder)) this.#onReorder(newArray)
  }

  setArray (array) {
    this.array = array
  }

  // Adapted from Adam Wathan's Advanced Vue Component Design course
  reorder (itemIndex, newIndex) {
    newIndex = (newIndex > this.array.length - 1)
      ? this.array.length - 1
      : (newIndex < 0)
        ? 0
        : newIndex

    const itemRemovedArray = [
            ...this.array.slice(0, itemIndex),
            ...this.array.slice(itemIndex + 1, this.array.length)
          ],
          newArray = [
            ...itemRemovedArray.slice(0, newIndex),
            this.array[itemIndex],
            ...itemRemovedArray.slice(newIndex, itemRemovedArray.length)
          ]

    this.reorderedArray = newArray
  }
}
