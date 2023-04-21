import {
  pipe,
  slice,
  toArray,
} from 'lazy-collections'
import type { ArrayFn } from './types'

export function createSlice<Item>(from: number, to?: number): ArrayFn<Item, Item[]> {
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
