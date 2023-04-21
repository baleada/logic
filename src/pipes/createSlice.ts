import {
  pipe,
  slice,
  toArray,
} from 'lazy-collections'
import type { ArrayFunction } from './types'

export function createSlice<Item>(from: number, to?: number): ArrayFunction<Item, Item[]> {
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
