/*
 * Searchable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */
import Dependency from '../wrappers/SearchableLunr.js'

/* Util */
import emit from '../util/emit'

export default class Searchable {
  #onSearch
  #dependencyOptions
  #dependency

  constructor (array, options = {}) {
    /* Options */
    options = {
      resultsIncludePosition: false,
      resultsIncludeItem: true,
      onSearch: (results, instance) => instance.setResults(results),
      ...options
    }

    this.#onSearch = options.onSearch

    /* Public properties */
    this.array = array
    this.results = []

    /* Dependency */
    this.#dependencyOptions = options
    this.#dependency = new Dependency(this.array, this.#dependencyOptions)
  }

  /* Public getters */
  get index () {
    return this.#dependency.index
  }

  /* Public methods */
  setArray (array) {
    this.array = array
    this.#dependency = new Dependency(this.array, this.#dependencyOptions)
    return this
  }
  setResults (results) {
    this.results = results
    return this
  }
  search (query) {
    const results = this.#dependency.search(query)
    emit(this.#onSearch, results, this)
    return this
  }

  /* Private methods */
}
