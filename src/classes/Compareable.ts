import { pipe, sort, join } from 'lazy-collections'
import { createEntries } from '../pipes'

export type CompareableOptions = {
  locales?: Parameters<typeof Intl.Collator>[0],
  collator?: Intl.CollatorOptions,
}

export type CompareableStatus = 'ready' | 'comparing' | 'compared'

const defaultOptions: CompareableOptions = {
  locales: 'en',
  collator: { sensitivity: 'base' },
}

export class Compareable {
  constructor (string: string, options: CompareableOptions = {}) {
    const locales = options.locales || defaultOptions.locales,
          collatorOptions = { ...defaultOptions.collator, ...(options.collator) },
          key = locales + pipe(
            createEntries(),
            sort((a, b) => a[0] < b[0] ? -1 : 1),
            join()
          )(collatorOptions) as string

    this.computedCollator = (
      cache[key]
      || (cache[key] = new Intl.Collator(locales, collatorOptions))
    )

    this.setString(string)
    this.ready()
  }
  private computedStatus: CompareableStatus
  private ready () {
    this.computedStatus = 'ready'
  }

  get string () {
    return this.computedString
  }
  set string (string) {
    this.setString(string)
  }
  get status () {
    return this.computedStatus
  }
  private computedCollator: Intl.Collator
  get collator () {
    return this.computedCollator
  }
  private computedComparison: -1 | 0 | 1
  get comparison () {
    return this.computedComparison
  }

  private computedString: string
  setString (string: string) {
    this.computedString = string
    return this
  }

  compare (compared: string) {
    this.comparing()
    this.computedComparison = this.computedCollator.compare(this.string, compared) as -1 | 0 | 1
    this.compared()
    return this
  }
  private comparing () {
    this.computedStatus = 'comparing'
  }
  private compared () {
    this.computedStatus = 'compared'
  }
}

const cache: Record<string, Intl.Collator> = {}
