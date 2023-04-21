import { pipe, toArray, filter } from 'lazy-collections'
import type { ArrayFn } from './types'

export function createFilter<Item>(predicate: (item: Item, index: number) => boolean): ArrayFn<Item, Item[]> {
  return array => pipe(
    filter(predicate),
    toArray()
  )(array) as Item[]
}
