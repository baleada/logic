/*
 * searchable.js v1.0.0
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

import SearchableDependency from '../wrappers/SearchableLunr.js'
import is from './is.js'

class Searchable {
  #onSearch
  #dependencyOptions
  #dependency

  constructor(array, options) {
    this.array = array

    options = {
      initialQuery: '',
      positionIsIncluded: false,
      itemIsIncluded: true,
      ...options
    }

    this.#onSearch = options.onSearch
    this.#dependencyOptions = this.#getDependencyOptions(options)
    this.#dependency = new SearchableDependency(this.array, this.#dependencyOptions)

    this.query = options.initialQuery
    this.results = []
  }

  // Utils
  #getDependencyOptions = ({ onSearch, ...rest }) => rest

  // TODO what is the use case for resetting array like this
  // setArray (array) {
  //   this.array = array
  // }
  setQuery (query) {
    this.query = query
  }

  search () {
    this.results = this.#dependency.search(this.query)
    if (is.function(this.#onSearch)) this.#onSearch(this.results)
  }
}

export default Searchable
