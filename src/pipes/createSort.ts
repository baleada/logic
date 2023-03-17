import { sort, toArray, pipe } from 'lazy-collections'
import type { ArrayFunction } from './types'

export function createSort<Item>(compare?: (itemA: Item, itemB: Item) => number): ArrayFunction<Item, Item[]> {
  return array => {
    return pipe(
      sort(compare),
      toArray()
    )(array)
  }
}
