/*
 * reorderable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

import isObject from '../util/isObject.js' // Direct import to prevent circular dependency

export default function reorderable (array) {
  const object = new Array(...array)

  // Adapted from Adam Wathan's Advanced Vue Component Design course
  object.reorder = ({ from, to }) => {
    const { itemsToMoveStartIndex, itemsToMoveCount } = getItemsToMoveStartIndexAndCount(from),
          insertIndex = to
          
    // Guard against item ranges that overlap the insert index. Not possible to reorder in that way.
    if (insertIndex > itemsToMoveStartIndex && insertIndex < itemsToMoveStartIndex + itemsToMoveCount) {
      return object
    }
          
    const itemsToMove = object.slice(itemsToMoveStartIndex, itemsToMoveStartIndex + itemsToMoveCount)

    let reordered
    if (itemsToMoveStartIndex < insertIndex) {
      const beforeItemsToMove = itemsToMoveStartIndex === 0 ? [] : object.slice(0, itemsToMoveStartIndex),
            betweenItemsToMoveAndInsertIndex = object.slice(itemsToMoveStartIndex + itemsToMoveCount, insertIndex + 1),
            afterInsertIndex = object.slice(insertIndex + 1)

      reordered = [
        ...beforeItemsToMove,
        ...betweenItemsToMoveAndInsertIndex,
        ...itemsToMove,
        ...afterInsertIndex,
      ]
    } else if (itemsToMoveStartIndex > insertIndex) {
      const beforeInsertion = insertIndex === 0 ? [] : object.slice(0, insertIndex),
            betweenInsertionAndItemsToMove = object.slice(insertIndex, itemsToMoveStartIndex),
            afterItemsToMove = object.slice(itemsToMoveStartIndex + itemsToMoveCount)

      reordered = [
        ...beforeInsertion,
        ...itemsToMove,
        ...betweenInsertionAndItemsToMove,
        ...afterItemsToMove,
      ]
    }
    
    return reorderable(reordered)
  }

  function getItemsToMoveStartIndexAndCount (from) {
    const itemsToMoveStartIndex = isObject(from) // from can be an object or a number
            ? from.start
            : from,
          itemsToMoveCount = isObject(from)
            ? from.itemCount
            : 1

    return { itemsToMoveStartIndex, itemsToMoveCount }
  }

  return object
}
