import type { ArrayFn } from './types'
import { createConcat } from './createConcat'
import { createSlice } from './createSlice'

export function createRemove<Item>(index: number): ArrayFn<Item, Item[]> {
  return array => {
    return createConcat(
      createSlice<Item>(0, index)(array),
      createSlice<Item>(index + 1)(array)
    )([])
  }
}
