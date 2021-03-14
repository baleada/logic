import { Searcher, FullOptions as SearcherOptions, MatchData as SearcherMatchData } from 'fast-fuzzy'

export default class Searchable {
  /**
   * 
   * @param {(string | Record<any, any>)[]} candidates 
   * @param {SearcherOptions<(string | Record<any, any>)>} [options] 
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
  get status () {
    return this._computedStatus
  }

  /**
   * @param {(string | Record<any, any>)[]} candidates 
   */
  setCandidates (candidates) {
    this._computedCandidates = Array.from(candidates)
    this._searcher = new Searcher(candidates, this._searcherOptions)

    return this
  }

  /**
   * 
   * @param {string} query 
   * @param {SearcherOptions<(string | Record<any, any>)>} [options] 
   */
  search (query, options) {
    const results = this._searcher.search(query, options)

    /**
     * @type {any[] | SearcherMatchData<(string | Record<any, any>)>[]} results 
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
