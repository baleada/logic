import type { ArrayFn } from './types'
import { createConcat } from './createConcat'
import { createSlice } from './createSlice'

export function createReplace<Item>(index: number, item: Item): ArrayFn<Item, Item[]> {
  return array => {
    return createConcat<Item>(
      createSlice<Item>(0, index)(array),
      [item],
      createSlice<Item>(index + 1)(array)
    )([])
  }
}
