import { Searcher } from 'fast-fuzzy'

export default class Searchable {
  constructor (candidates, options = {}) {
    this._searcherOptions = options

    this.setCandidates(candidates)
    this._setResults([])
    this._ready()
  }
  _ready () {
    this._computedStatus = 'ready'
  }

  get candidates () {
    return this._computedCandidates
  }
  set candidates (candidates) {
    this.setCandidates(candidates)
  }
  get status () {
    return this._computedStatus
  }
  get results () {
    return this._computedResults
  }
  get trie () {
    return this._searcher.trie
  }

  /* Public methods */
  setCandidates (candidates) {
    this._computedCandidates = Array.from(candidates)
    this._searcher = new Searcher(candidates, this._searcherOptions)

    return this
  }

  _setResults (results) {
    this._computedResults = results
  }

  search (query, options) {
    const results = this._searcher.search(query, options)
    this._setResults(results)

    switch (this.status) {
    case 'ready':
      this._searched()
      break
    }

    return this
  }
  _searched () {
    this._computedStatus = 'searched'
  }
}
