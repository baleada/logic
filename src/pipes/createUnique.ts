import { pipe, toArray, unique } from 'lazy-collections'
import type { ArrayFn } from './types'

export function createUnique<Item>(): ArrayFn<Item, Item[]> {
  return array => pipe(
    unique(),
    toArray()
  )(array) as Item[]
}
