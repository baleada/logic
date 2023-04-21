import { pipe, toArray, concat } from 'lazy-collections'
import type { ArrayFn } from './types'

export function createConcat<Item>(...arrays: Item[][]): ArrayFn<Item, Item[]> {
  return array => pipe(
    concat(array, ...arrays),
    toArray<Item>()
  )() as Item[]
}
