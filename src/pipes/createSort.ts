import type { ArrayFunction } from './types'
import { createSlice } from './createSlice'
import { Pipeable } from './Pipeable'

export function createSort<Item>(compare?: (itemA: Item, itemB: Item) => number): ArrayFunction<Item, Item[]> {
  return array => {
    return new Pipeable(array).pipe(
      createSlice(0),
      sliced => compare ? sliced.sort(compare) : sliced.sort()
    );
  };
}
