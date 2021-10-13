import { find as lazyCollectionFind } from 'lazy-collections'
import { createMap, createFilter, createConcat } from "../pipes"
import { isUndefined } from '../extracted'

export type PickableOptions = {
  initialPicked?: number | number[],
}

export type PickableStatus = 'ready' | 'picked' | 'omitted'

const defaultOptions: PickableOptions = {
  initialPicked: [],
}

export class Pickable<Item> {
  constructor (array: Item[], options: PickableOptions = {}) {
    this.computedArray = array
    this.pick(options.initialPicked ?? defaultOptions.initialPicked)
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
  private computedPicked: number[]
  get picked () {
    return this.computedPicked
  }
  set picked (indices: number[]) {
    this.pick(indices)
  }
  get status () {
    return this.computedStatus
  }
  get items () {
    return this.toItems(this.picked)
  }
  private toItems = createMap<number, Item>(index => this.array[index])
  get multiple () {
    return this.picked.length > 1
  }

  setArray (array: Item[]) {
    this.computedArray = array
    return this
  }

  setPicked (indexOrIndices: number | number[]) {
    return this.pick(indexOrIndices)
  }

  pick (indexOrIndices: number | number[]) {
    this.computedPicked = createConcat<number>(ensureIndices(indexOrIndices))(this.computedPicked || [])
    this._picked()

    return this
  }
  private _picked () {
    this.computedStatus = 'picked'
  }

  omit (indexOrIndices?: number | number[]) {
    if (isUndefined(indexOrIndices)) {
      this.computedPicked = []
      this.omitted()
      return this
    }

    const indices = ensureIndices(indexOrIndices),
          filter = createFilter<number>(pickedItem => !(lazyCollectionFind(index => pickedItem === index)(indices) as number))

    this.computedPicked = filter(this.computedPicked)
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
