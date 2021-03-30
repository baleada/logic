import { Searcher } from 'fast-fuzzy'
import type { FullOptions as SearcherOptions, MatchData as SearcherMatchData } from 'fast-fuzzy'

export class Searchable<Item extends string | object> {
  _searcherOptions: SearcherOptions<Item>
  _computedResults: SearcherMatchData<Item>[] | Item[]
  constructor (candidates: Item[], options: SearcherOptions<Item> = {}) {
    this._searcherOptions = options

    this.setCandidates(candidates)
    this._computedResults = []
    this._ready()
  }
  _computedStatus: 'ready' | 'searched'
  _ready () {
    this._computedStatus = 'ready'
  }

  _computedCandidates: Item[]
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

  _computedSearcher: Searcher<Item, SearcherOptions<Item>>
  setCandidates (candidates: Item[]) {
    this._computedCandidates = Array.from(candidates)
    this._computedSearcher = new Searcher(candidates, this._searcherOptions)

    return this
  }

  search (query: string, options: SearcherOptions<Item>) {
    this._computedResults = this.searcher.search<SearcherOptions<Item>>(query, options)

    this._searched()

    return this
  }
  _searched () {
    this._computedStatus = 'searched'
  }
}
