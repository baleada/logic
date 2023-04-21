import {
  pipe,
  slice,
  toArray
} from 'lazy-collections';
import type { ArrayFunction } from './types'

export function createSlice<Item>(from: number, to?: number): ArrayFunction<Item, Item[]> {
  return array => {
    return from === to
      ? []
      : pipe(
        slice(from, to - 1),
        toArray()
      )(array) as Item[];
  };
}
