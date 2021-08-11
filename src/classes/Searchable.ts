import { Searcher } from 'fast-fuzzy'
import type { FullOptions as SearcherOptions, MatchData as SearcherMatchData } from 'fast-fuzzy'

export type SearchableOptions<Item> = SearcherOptions<Item>

export type SearchableStatus = 'ready' | 'searched'

export class Searchable<Item extends string | object> {
  private searcherOptions: SearcherOptions<Item>
  private computedResults: SearcherMatchData<Item>[] | Item[]
  constructor (candidates: Item[], options: SearcherOptions<Item> = {}) {
    this.searcherOptions = options

    this.setCandidates(candidates)
    this.computedResults = []
    this.ready()
  }
  private computedStatus: SearchableStatus
  private ready () {
    this.computedStatus = 'ready'
  }

  private computedCandidates: Item[]
  get candidates () {
    return this.computedCandidates
  }
  set candidates (candidates) {
    this.setCandidates(candidates)
  }
  get results () {
    return this.computedResults
  }
  get searcher () {
    return this.computedSearcher
  }
  get status () {
    return this.computedStatus
  }

  private computedSearcher: Searcher<Item, SearcherOptions<Item>>
  setCandidates (candidates: Item[]) {
    this.computedCandidates = Array.from(candidates)
    this.computedSearcher = new Searcher(candidates, this.searcherOptions)

    return this
  }

  search (query: string, options: SearcherOptions<Item>) {
    this.computedResults = this.searcher.search<SearcherOptions<Item>>(query, options)

    this.searched()

    return this
  }
  private searched () {
    this.computedStatus = 'searched'
  }
}
