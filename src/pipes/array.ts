import arrayShuffle from 'array-shuffle'
import { pipe, toArray, concat, unique, filter, map, reduce, slice, sort } from 'lazy-collections'
import { predicateObject } from '../extracted'

export type ArrayTransform<Item, Transformed> = (array: Item[]) => Transformed

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/concat)
 */
export function createConcat<Item>(...arrays: Item[][]): ArrayTransform<Item, Item[]> {
  return array => pipe(
    concat(array, ...arrays),
    toArray<Item>()
  )() as Item[]
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/filter)
 */
export function createFilter<Item>(predicate: (item: Item, index: number) => boolean): ArrayTransform<Item, Item[]> {
  return array => pipe(
    filter(predicate),
    toArray()
  )(array) as Item[]
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/insert)
 */
export function createInsert<Item>(item: Item, index: number): ArrayTransform<Item, Item[]> {
  return array => {
    const withItems = createConcat(array, [item])([])

    return createReorder<Item>(
      { start: array.length, itemCount: 1 },
      index
    )(withItems)
  }
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/map)
 */
export function createMap<Item, Transformed = Item>(transform: (item: Item, index: number) => Transformed): ArrayTransform<Item, Transformed[]> {
  return array => pipe(
    map(transform),
    toArray()
  )(array) as Transformed[]
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/reduce)
 */
export function createReduce<Item, Accumulator>(
  accumulate: (accumulator: Accumulator, item: Item, index: number) => Accumulator,
  initialValue?: Accumulator
): (array: Item[]) => Accumulator {
  return array => reduce<Accumulator, Item>(accumulate, initialValue)(array) as Accumulator
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/remove)
 */
export function createRemove<Item>(index: number): ArrayTransform<Item, Item[]> {
  return array => {
    return createConcat(
      createSlice<Item>(0, index)(array),
      createSlice<Item>(index + 1)(array)
    )([])
  }
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/reorder)
 */
export function createReorder<Item>(
  from: { start: number; itemCount: number; } | number,
  to: number
): ArrayTransform<Item, Item[]> {
  return array => {
    const [itemsToMoveStartIndex, itemsToMoveCount] = predicateObject(from)
      ? [from.start, from.itemCount]
      : [from, 1], insertIndex = to

    // Guard against item ranges that overlap the insert index. Not possible to reorder in that way.
    if (insertIndex > itemsToMoveStartIndex && insertIndex < itemsToMoveStartIndex + itemsToMoveCount) {
      return array
    }

    const itemsToMove = createSlice<Item>(itemsToMoveStartIndex, itemsToMoveStartIndex + itemsToMoveCount)(array)

    if (itemsToMoveStartIndex < insertIndex) {
      const beforeItemsToMove = itemsToMoveStartIndex === 0 ? [] : createSlice<Item>(0, itemsToMoveStartIndex)(array), betweenItemsToMoveAndInsertIndex = createSlice<Item>(itemsToMoveStartIndex + itemsToMoveCount, insertIndex + 1)(array), afterInsertIndex = createSlice<Item>(insertIndex + 1)(array)

      return createConcat<Item>(
        beforeItemsToMove,
        betweenItemsToMoveAndInsertIndex,
        itemsToMove,
        afterInsertIndex
      )([])
    }

    if (itemsToMoveStartIndex > insertIndex) {
      const beforeInsertion = insertIndex === 0 ? [] : createSlice<Item>(0, insertIndex)(array), betweenInsertionAndItemsToMove = createSlice<Item>(insertIndex, itemsToMoveStartIndex)(array), afterItemsToMove = createSlice<Item>(itemsToMoveStartIndex + itemsToMoveCount)(array)

      return createConcat<Item>(
        beforeInsertion,
        itemsToMove,
        betweenInsertionAndItemsToMove,
        afterItemsToMove
      )([])
    }

    return array
  }
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/replace)
 */
export function createReplace<Item>(index: number, replacement: Item): ArrayTransform<Item, Item[]> {
  return createMap<Item, Item>((item, i) => i === index ? replacement : item)
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/reverse)
 */
export function createReverse<Item>(): ArrayTransform<Item, Item[]> {
  return array => {
    const reversed = []

    for (let i = array.length - 1; i > -1; i--) {
      reversed.push(array[i])
    }

    return reversed
  }
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/slice)
 */
export function createSlice<Item>(from: number, to?: number): ArrayTransform<Item, Item[]> {
  if (from < 0 || to && to < 0) return array => array.slice(from, to)

  const toSliced = to ? slice(from, to - 1) : slice(from)

  return array => {
    return from === to
      ? []
      : pipe(
        toSliced,
        toArray()
      )(array) as Item[]
  }
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/shuffle)
 */
export function createShuffle<Item>(): ArrayTransform<Item, Item[]> {
  return array => {
    return arrayShuffle(array)
  }
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/sort)
 */
export function createSort<Item>(compare?: (itemA: Item, itemB: Item) => number): ArrayTransform<Item, Item[]> {
  return array => {
    return pipe(
      sort(compare),
      toArray()
    )(array)
  }
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/swap)
 */
export function createSwap<Item>(item1Index: number, item2Index: number): ArrayTransform<Item, Item[]> {
  return array => {
    const { reorderFrom, reorderTo } = (() => {
      if (item1Index < item2Index) {
        return {
          reorderFrom: createReorder<Item>(item1Index, item2Index),
          reorderTo: createReorder<Item>(item2Index - 1, item1Index),
        }
      }

      if (item1Index > item2Index) {
        return {
          reorderFrom: createReorder<Item>(item1Index, item2Index),
          reorderTo: createReorder<Item>(item2Index + 1, item1Index),
        }
      }

      return {
        reorderFrom: (array => array) as ArrayTransform<Item, Item[]>,
        reorderTo: (array => array) as ArrayTransform<Item, Item[]>,
      }
    })()

    return pipe(reorderFrom, reorderTo)(array)
  }
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/unique)
 */
export function createUnique<Item>(): ArrayTransform<Item, Item[]> {
  return array => pipe(
    unique(),
    toArray()
  )(array) as Item[]
}
