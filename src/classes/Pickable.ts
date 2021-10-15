import { find as lazyCollectionFind } from 'lazy-collections'
import { createMap, createFilter, createConcat, Pipeable } from "../pipes"
import { isUndefined } from '../extracted'

export type PickableOptions = {
  initialPicks?: number | number[],
}

export type PickableStatus = 'ready' | 'picked' | 'omitted'

const defaultOptions: PickableOptions = {
  initialPicks: [],
}

export class Pickable<Item> {
  constructor (array: Item[], options: PickableOptions = {}) {
    this.setArray(array)
    this.pick(options.initialPicks ?? defaultOptions.initialPicks)
    this.ready()
  }
  private computedStatus: PickableStatus
  private ready () {
    this.computedStatus = 'ready'
  }

  private computedArray: Item[]
  get array () {
    return this.computedArray
  }
  set array (array: Item[]) {
    this.setArray(array)
  }
  private computedPicks: number[]
  get picks () {
    return this.computedPicks
  }
  set picks (indices: number[]) {
    this.pick(indices)
  }
  get status () {
    return this.computedStatus
  }
  get items () {
    return this.toItems(this.picks)
  }
  private toItems = createMap<number, Item>(index => this.array[index])
  get multiple () {
    return this.picks.length > 1
  }


  private toPossiblePicks: (indices: number[]) => number[]
  setArray (array: Item[]) {
    this.computedArray = array
    this.toPossiblePicks = createFilter<number>(index => index >= 0 && index < array.length)
    return this
  }

  setPicks (indexOrIndices: number | number[]) {
    return this.pick(indexOrIndices)
  }

  pick (indexOrIndices: number | number[], options: { replaces?: boolean } = {}) {
    const { replaces } = options
    
    const newPicks = new Pipeable(indexOrIndices).pipe(
      ensureIndices,
      this.toPossiblePicks,
      possiblePicks => {
        if (replaces) return possiblePicks
        // TODO: Option to handle duplicates differently
        return createFilter<number>(possiblePick => !(lazyCollectionFind<number>(pick => pick === possiblePick)(this.picks || [])))(possiblePicks)
      }
    )

    if (replaces) {
      this.computedPicks = newPicks
      this.picked()
      return this
    }

    this.computedPicks = createConcat<number>(newPicks)(this.picks || [])
    this.picked()
    return this
  }
  private picked () {
    this.computedStatus = 'picked'
  }

  omit (indexOrIndices?: number | number[]) {
    if (isUndefined(indexOrIndices)) {
      this.computedPicks = []
      this.omitted()
      return this
    }

    const omits = ensureIndices(indexOrIndices),
          filter = createFilter<number>(pick => isUndefined(lazyCollectionFind(omit => pick === omit)(omits)))

    this.computedPicks = filter(this.computedPicks)
    this.omitted()
    return this
  }
  private omitted () {
    this.computedStatus = 'omitted'
  }
}

function ensureIndices (indexOrIndices: number | number[]): number[] {
  return Array.isArray(indexOrIndices)
    ? indexOrIndices
    : [indexOrIndices]
}
