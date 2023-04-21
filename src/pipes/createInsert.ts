import type { ArrayFunction } from './types'
import { createConcat } from './createConcat'
import { createReorder } from './createReorder'

export function createInsert<Item>(item: Item, index: number): ArrayFunction<Item, Item[]> {
  return array => {
    const withItems = createConcat(array, [item])([]);

    return createReorder<Item>(
      { start: array.length, itemCount: 1 },
      index
    )(withItems);
  };
}
