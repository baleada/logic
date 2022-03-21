import { find } from 'lazy-collections'
import { createMap, createFilter, createConcat, Pipeable, createSlice, createUnique } from "../pipes"
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
  computedFirst: number
  get first () {
    return this.computedFirst
  }
  computedLast: number 
  get last () {
    return this.computedLast
  }
  get oldest () {
    return this.picks[0]
  }
  get newest () {
    return this.picks[this.picks.length - 1]
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

  pick (indexOrIndices: number | number[], options: { replace?: 'none' | 'all' | 'fifo' | 'lifo' } = {}) {
    const { replace = 'none' } = options
    
    this.computedPicks = new Pipeable(indexOrIndices).pipe(
      ensureIndices,
      this.toPossiblePicks,
      (possiblePicks: number[]) => {
        if (replace === 'all') {
          return toUnique(possiblePicks)
        }

        const possibleWithoutDuplicates = createFilter<number>(possiblePick => typeof find<number>(pick => pick === possiblePick)(this.picks || []) !== 'number')(possiblePicks)

        switch (replace) {
          case 'none':
            return createConcat<number>(this.picks || [], possibleWithoutDuplicates)([])
          case 'fifo':
            if (possibleWithoutDuplicates.length === 0) {
              return this.picks
            }

            if (possibleWithoutDuplicates.length === this.picks.length) {
              return possibleWithoutDuplicates
            }

            if (possibleWithoutDuplicates.length > this.picks.length) {
              return createSlice<number>(possibleWithoutDuplicates.length - this.picks.length)(possibleWithoutDuplicates)
            }

            return new Pipeable(this.picks).pipe(
              createSlice<number>(possibleWithoutDuplicates.length),
              createConcat<number>(possibleWithoutDuplicates)
            )
          case 'lifo': 
            if (possibleWithoutDuplicates.length === 0) {
              return this.picks
            }

            if (possibleWithoutDuplicates.length === this.picks.length) {
              return possibleWithoutDuplicates
            }

            if (possibleWithoutDuplicates.length > this.picks.length) {
              return createSlice<number>(0, possibleWithoutDuplicates.length - this.picks.length + 1)(possibleWithoutDuplicates)
            }

            return new Pipeable(this.picks).pipe(
              createSlice<number>(0, this.picks.length - possibleWithoutDuplicates.length),
              createConcat<number>(possibleWithoutDuplicates)
            )
        }
      }
    )

    this.computedFirst = Math.min(...this.picks)
    this.computedLast = Math.max(...this.picks)
    
    this.picked()
    return this
  }
  private picked () {
    this.computedStatus = 'picked'
  }

  omit (indexOrIndices?: number | number[], options: { reference?: 'array' | 'picks' } = { reference: 'array' }) {
    if (isUndefined(indexOrIndices)) {
      this.computedPicks = []
      this.computedFirst = undefined
      this.computedLast = undefined
      this.omitted()
      return this
    }

    const omits = ensureIndices(indexOrIndices)

    this.computedPicks = createFilter<number>((pick, index) =>
      options.reference === 'array'
        ? isUndefined(find(omit => pick === omit)(omits))
        : isUndefined(find(omit => index === omit)(omits))
    )(this.computedPicks)
    this.computedFirst = Math.min(...this.picks)
    this.computedLast = Math.max(...this.picks)
    
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

const toUnique = createUnique<number>()
