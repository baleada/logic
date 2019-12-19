/*
 * Reorderable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

export default function reorderable (array) {
  const object = array

  function getSliceFromAndSliceItemCount (param) {
    const sliceFrom = param.hasOwnProperty('start')
            ? param.start
            : Number(param),
          sliceItemCount = param.hasOwnProperty('itemCount')
            ? param.itemCount
            : param.hasOwnProperty('start')
              ? 0
              : 1

    return { sliceFrom, sliceItemCount }
  }

  function getSpliceFrom ({ param, sliceFrom }) {
    return param >= 0
      ? param
      : sliceFrom
  }

  object.reorder = (itemsToMoveParam, itemsDestinationParam) => {
    const { sliceFrom, sliceItemCount } = getSliceFromAndSliceItemCount(itemsToMoveParam),
          spliceFrom = getSpliceFrom({ param: itemsDestinationParam, sliceFrom }),
          itemsToMove = object.slice(sliceFrom, sliceFrom + sliceItemCount),
          before = object.slice(0, sliceFrom),
          middle = object.slice(sliceFrom + sliceItemCount, spliceFrom + 1),
          after = object.slice(spliceFrom + 1),
          reordered = [
            ...before,
            ...middle,
            ...itemsToMove,
            ...after,
          ]

    return reorderable(reordered)
  } // Adapted from Adam Wathan's Advanced Vue Component Design course

  return object
}
