import { Searcher } from 'fast-fuzzy'

export class Searchable {
  /**
   * 
   * @param {(string | Record<any, any>)[]} candidates 
   * @param {import('fast-fuzzy').FullOptions<(string | Record<any, any>)>} [options] 
   */
  constructor (candidates, options = {}) {
    this._searcherOptions = options

    this.setCandidates(candidates)
    this._computedResults = []
    this._ready()
  }
  _ready () {
    /**
     * @type {('ready' | 'searched')}
     */
    this._computedStatus = 'ready'
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
  get searcher () {
    return this._computedSearcher
  }
  get status () {
    return this._computedStatus
  }

  /**
   * @param {(string | Record<any, any>)[]} candidates 
   */
  setCandidates (candidates) {
    this._computedCandidates = Array.from(candidates)
    this._computedSearcher = new Searcher(candidates, this._searcherOptions)

    return this
  }

  /**
   * 
   * @param {string} query 
   * @param {import('fast-fuzzy').FullOptions<(string | Record<any, any>)>} [options] 
   */
  search (query, options) {
    const results = this.searcher.search(query, options)

    /**
     * @type {any[] | import('fast-fuzzy').MatchData<(string | Record<any, any>)>[]} results 
     */
    this._computedResults = results

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
