/*
 * Reorderable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */

/* Utils */
import is from '../utils/is'

export default class Reorderable {
  #onReorder

  constructor(array, options = {}) {
    /* Options */
    this.#onReorder = options.onReorder

    /* Public properties */
    this.array = array

    /* Private properties */

    /* Dependency */
  }

  /* Public getters */

  /* Public methods */
  setArray(array) {
    this.array = array
    return this
  }
  reorder(itemIndex, newIndex) { // Adapted from Adam Wathan's Advanced Vue Component Design course
    const itemRemovedArray = [
            ...this.array.slice(0, itemIndex),
            ...this.array.slice(itemIndex + 1, this.array.length)
          ],
          newArray = [
            ...itemRemovedArray.slice(0, newIndex),
            this.array[itemIndex],
            ...itemRemovedArray.slice(newIndex, itemRemovedArray.length)
          ]

    if (is.function(this.#onReorder)) this.#onReorder(newArray)
    return this
  }

  /* Private methods */
}
