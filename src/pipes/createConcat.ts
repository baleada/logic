import { pipe, toArray, concat } from 'lazy-collections'

import type { ArrayFunction } from './types'
export function createConcat<Item>(...arrays: Item[][]): ArrayFunction<Item, Item[]> {
  return array => pipe(
    concat(array, ...arrays),
    toArray<Item>()
  )() as Item[];
}
