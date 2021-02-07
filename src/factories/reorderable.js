/*
 * reorderable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

export default function reorderable (array) {
  const reorder = ({ from, to }) => {
    const { itemsToMoveStartIndex, itemsToMoveCount } = getItemsToMoveStartIndexAndCount(from),
          insertIndex = to
          
    // Guard against item ranges that overlap the insert index. Not possible to reorder in that way.
    if (insertIndex > itemsToMoveStartIndex && insertIndex < itemsToMoveStartIndex + itemsToMoveCount) {
      return array
    }
          
    const itemsToMove = array.slice(itemsToMoveStartIndex, itemsToMoveStartIndex + itemsToMoveCount)

    let reordered
    if (itemsToMoveStartIndex < insertIndex) {
      const beforeItemsToMove = itemsToMoveStartIndex === 0 ? [] : array.slice(0, itemsToMoveStartIndex),
            betweenItemsToMoveAndInsertIndex = array.slice(itemsToMoveStartIndex + itemsToMoveCount, insertIndex + 1),
            afterInsertIndex = array.slice(insertIndex + 1)

      reordered = [
        ...beforeItemsToMove,
        ...betweenItemsToMoveAndInsertIndex,
        ...itemsToMove,
        ...afterInsertIndex,
      ]
    } else if (itemsToMoveStartIndex > insertIndex) {
      const beforeInsertion = insertIndex === 0 ? [] : array.slice(0, insertIndex),
            betweenInsertionAndItemsToMove = array.slice(insertIndex, itemsToMoveStartIndex),
            afterItemsToMove = array.slice(itemsToMoveStartIndex + itemsToMoveCount)

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
    const itemsToMoveStartIndex = from.start ?? from,
          itemsToMoveCount = from.itemCount ?? 1

    return { itemsToMoveStartIndex, itemsToMoveCount }
  }

  return { reorder, value: array }
}
