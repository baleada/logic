/*
 * Searchable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */
import { SearchableLunr as Dependency } from '../wrappers'

/* Util */
import { emit } from '../util/functions'

export default class Searchable {
  // _onSearch
  // _dependencyOptions
  // _dependency

  constructor (array, options = {}) {
    /* Options */
    options = {
      resultsIncludePosition: false,
      resultsIncludeItem: true,
      onSearch: (results, instance) => instance.setResults(results),
      ...options
    }

    this._onSearch = options.onSearch

    /* Public properties */
    this.array = array
    this.results = []

    /* Dependency */
    this._dependencyOptions = options
    this._dependency = new Dependency(this.array, this._dependencyOptions)
  }

  /* Public getters */
  get index () {
    return this._dependency.index
  }

  /* Public methods */
  setArray (array) {
    this.array = array
    this._dependency = new Dependency(this.array, this._dependencyOptions)
    return this
  }
  setResults (results) {
    this.results = results
    return this
  }
  search (query) {
    const results = this._dependency.search(query)
    emit(this._onSearch, results, this)
    return this
  }

  /* Private methods */
  _getResults = function(matchData) {
    // TODO: structure results in a more palatable format
  }
}
