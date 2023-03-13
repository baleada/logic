import { pipe, toArray, filter } from 'lazy-collections'
import type { ArrayFunction } from './types'

export function createFilter<Item>(predicate: (item: Item, index: number) => boolean): ArrayFunction<Item, Item[]> {
  return array => pipe(
    filter(predicate),
    toArray()
  )(array) as Item[];
}
