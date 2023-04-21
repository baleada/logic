import type { ArrayFunction } from './types'

import { predicateObject } from '../extracted'
import { createConcat } from './createConcat'

import { createSlice } from './createSlice'
export function createReorder<Item>(
  from: { start: number; itemCount: number; } | number,
  to: number
): ArrayFunction<Item, Item[]> {
  return array => {
    const [itemsToMoveStartIndex, itemsToMoveCount] = predicateObject(from)
      ? [from.start, from.itemCount]
      : [from, 1], insertIndex = to;

    // Guard against item ranges that overlap the insert index. Not possible to reorder in that way.
    if (insertIndex > itemsToMoveStartIndex && insertIndex < itemsToMoveStartIndex + itemsToMoveCount) {
      return array;
    }

    const itemsToMove = createSlice<Item>(itemsToMoveStartIndex, itemsToMoveStartIndex + itemsToMoveCount)(array);

    if (itemsToMoveStartIndex < insertIndex) {
      const beforeItemsToMove = itemsToMoveStartIndex === 0 ? [] : createSlice<Item>(0, itemsToMoveStartIndex)(array), betweenItemsToMoveAndInsertIndex = createSlice<Item>(itemsToMoveStartIndex + itemsToMoveCount, insertIndex + 1)(array), afterInsertIndex = createSlice<Item>(insertIndex + 1)(array);

      return createConcat<Item>(
        beforeItemsToMove,
        betweenItemsToMoveAndInsertIndex,
        itemsToMove,
        afterInsertIndex
      )([]);
    }

    if (itemsToMoveStartIndex > insertIndex) {
      const beforeInsertion = insertIndex === 0 ? [] : createSlice<Item>(0, insertIndex)(array), betweenInsertionAndItemsToMove = createSlice<Item>(insertIndex, itemsToMoveStartIndex)(array), afterItemsToMove = createSlice<Item>(itemsToMoveStartIndex + itemsToMoveCount)(array);

      return createConcat<Item>(
        beforeInsertion,
        itemsToMove,
        betweenInsertionAndItemsToMove,
        afterItemsToMove
      )([]);
    }

    return array;
  };
}
