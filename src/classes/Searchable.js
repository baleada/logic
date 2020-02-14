/*
 * Searchable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */
import { Searcher } from 'fast-fuzzy'

/* Util */
import { emit } from '../util'

export default class Searchable {
  constructor (candidates, options = {}) {
    /* Options */
    options = {
      onSearch: (results, instance) => instance.setResults(results),
      ...options
    }

    this._onSearch = options.onSearch
    this._searcherOptions = this._getSearcherOptions(options)

    /* Public properties */
    this.setCandidates(candidates)
    this.setResults([])
  }

  _getSearcherOptions ({ onSearch, ...rest }) {
    return rest
  }

  /* Public getters */
  get trie () {
    return this._searcher.trie
  }

  /* Public methods */
  setCandidates (candidates) {
    this.candidates = candidates
    this._searcher = this._getSearcher(candidates)

    return this
  }
  _getSearcher (candidates) {
    return new Searcher(candidates, this._searcherOptions)
  }

  setResults (results) {
    this.results = results

    return this
  }

  search (query, options) {
    const results = this._searcher.search(query, options)
    emit(this._onSearch, results, this)

    return this
  }
}
