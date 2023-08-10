import arrayShuffle from 'array-shuffle'
import { pipe, toArray, concat, unique, filter, map, reduce, slice, sort } from 'lazy-collections'
import { predicateObject } from '../extracted'

export type ArrayTransform<Item, Transformed> = (array: Item[]) => Transformed

export function createConcat<Item>(...arrays: Item[][]): ArrayTransform<Item, Item[]> {
  return array => pipe(
    concat(array, ...arrays),
    toArray<Item>()
  )() as Item[]
}

export function createFilter<Item>(predicate: (item: Item, index: number) => boolean): ArrayTransform<Item, Item[]> {
  return array => pipe(
    filter(predicate),
    toArray()
  )(array) as Item[]
}

export function createInsert<Item>(item: Item, index: number): ArrayTransform<Item, Item[]> {
  return array => {
    const withItems = createConcat(array, [item])([])

    return createReorder<Item>(
      { start: array.length, itemCount: 1 },
      index
    )(withItems)
  }
}

export function createMap<Item, Transformed = Item>(transform: (item: Item, index: number) => Transformed): ArrayTransform<Item, Transformed[]> {
  return array => pipe(
    map(transform),
    toArray()
  )(array) as Transformed[]
}

export function createReduce<Item, Accumulator>(
  accumulate: (accumulator: Accumulator, item: Item, index: number) => Accumulator,
  initialValue?: Accumulator
): (array: Item[]) => Accumulator {
  return array => reduce<Accumulator, Item>(accumulate, initialValue)(array) as Accumulator
}

export function createRemove<Item>(index: number): ArrayTransform<Item, Item[]> {
  return array => {
    return createConcat(
      createSlice<Item>(0, index)(array),
      createSlice<Item>(index + 1)(array)
    )([])
  }
}

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

export function createReplace<Item>(index: number, replacement: Item): ArrayTransform<Item, Item[]> {
  return createMap<Item, Item>((item, i) => i === index ? replacement : item)
}

export function createReverse<Item>(): ArrayTransform<Item, Item[]> {
  return array => {
    const reversed = []

    for (let i = array.length - 1; i > -1; i--) {
      reversed.push(array[i])
    }

    return reversed
  }
}

export function createSlice<Item>(from: number, to?: number): ArrayTransform<Item, Item[]> {
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

export function createShuffle<Item>(): ArrayTransform<Item, Item[]> {
  return array => {
    return arrayShuffle(array)
  }
}

export function createSort<Item>(compare?: (itemA: Item, itemB: Item) => number): ArrayTransform<Item, Item[]> {
  return array => {
    return pipe(
      sort(compare),
      toArray()
    )(array)
  }
}

export function createSwap<Item>(indices: [number, number]): ArrayTransform<Item, Item[]> {
  return array => {
    const { 0: from, 1: to } = indices, { reorderFrom, reorderTo } = ((): { reorderFrom: ArrayTransform<Item, Item[]>; reorderTo: ArrayTransform<Item, Item[]>; } => {
      if (from < to) {
        return {
          reorderFrom: createReorder<Item>(from, to),
          reorderTo: createReorder<Item>(to - 1, from),
        }
      }

      if (from > to) {
        return {
          reorderFrom: createReorder<Item>(from, to),
          reorderTo: createReorder<Item>(to + 1, from),
        }
      }

      return {
        reorderFrom: array => array,
        reorderTo: array => array,
      }
    })()

    return pipe(reorderFrom, reorderTo)(array)
  }
}

export function createUnique<Item>(): ArrayTransform<Item, Item[]> {
  return array => pipe(
    unique(),
    toArray()
  )(array) as Item[]
}
