import { pipe, toArray, unique } from 'lazy-collections'
import type { ArrayFunction } from './types'

export function createUnique<Item>(): ArrayFunction<Item, Item[]> {
  return array => pipe(
    unique(),
    toArray()
  )(array) as Item[]
}
