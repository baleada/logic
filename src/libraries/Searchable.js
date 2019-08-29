/*
 * Searchable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */
import Dependency from '../wrappers/SearchableLunr.js'

/* Utils */

export default class Searchable {
  #computedResults
  #dependencyOptions
  #dependency

  constructor(array, options = {}) {
    /* Options */
    options = {
      positionIsIncluded: false,
      itemIsIncluded: true,
      ...options
    }

    /* Public properties */
    this.array = array

    /* Private properties */
    this.#computedResults = []

    /* Dependency */
    this.#dependencyOptions = options
    this.#dependency = new Dependency(this.array, this.#dependencyOptions)
  }

  /* Public getters */
  get results() {
    return this.#computedResults
  }
  get index() {
    return this.#dependency
  }

  /* Public methods */
  setArray(array) {
    this.array = array
    this.#dependency = new Dependency(this.array, this.#dependencyOptions)
    return this
  }
  search(query) {
    this.#computedResults = this.#dependency.search(query)
    return this
  }

  /* Private methods */
}
