import { sort, toArray, pipe } from 'lazy-collections'
import type { ArrayFn } from './types'

export function createSort<Item>(compare?: (itemA: Item, itemB: Item) => number): ArrayFn<Item, Item[]> {
  return array => {
    return pipe(
      sort(compare),
      toArray()
    )(array)
  }
}
