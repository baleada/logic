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
    this._searcherOptions = this._getSearcherOptions(options)

    /* Public properties */
    this.setCandidates(candidates)
    this._setResults([])
  }

  _getSearcherOptions ({ onSearch, ...rest }) {
    return rest
  }

  get candidates () {
    return this._computedCandidates
  }
  set candidates (candidates) {
    this.setCandidates(candidates)
  }
  get results () {
    return this._computedResults
  }
  get trie () {
    return this._searcher.trie
  }

  /* Public methods */
  setCandidates (candidates) {
    this._computedCandidates = candidates
    this._searcher = this._getSearcher(candidates)

    return this
  }
  _getSearcher (candidates) {
    return new Searcher(candidates, this._searcherOptions)
  }

  _setResults (results) {
    this._computedResults = results
  }

  search (query, options) {
    const results = this._searcher.search(query, options)
    this._setResults(results)

    return this
  }
}
