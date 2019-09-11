/*
 * Reorderable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Utils */
import is from '../utils/is'

export default class Reorderable extends Array {
  reorder (itemsToMoveParam, itemsDestinationParam) {
    const { sliceFrom, sliceItemCount } = this.#getSliceFromAndSliceItemCount(itemsToMoveParam),
          { spliceFrom, spliceDeleteCount } = this.#getSpliceFromAndSpliceDeleteCount(itemsDestinationParam, sliceFrom),
          itemsToMove = this.slice(sliceFrom, sliceFrom + sliceItemCount),
          withItemsMoved = [
            ...this.slice(0, sliceFrom),
            ...this.slice(sliceFrom + sliceItemCount + 1, spliceFrom),
            ...itemsToMove,
            ...this.slice(spliceFrom + spliceDeleteCount)
          ]

    return withItemsMoved
  } // Adapted from Adam Wathan's Advanced Vue Component Design course

  /* Private methods */
  #getSliceFromAndSliceItemCount = function(param) {
    const sliceFrom = is.number(param)
            ? param
            : is.object(param)
              ? param.hasOwnProperty('from')
                ? param.from
                : 0
              : 0,
          sliceItemCount = is.number(param)
            ? 1
            : is.object(param)
              ? param.hasOwnProperty('itemCount')
                ? param.itemCount
                : 1
              : 0

    return { sliceFrom, sliceItemCount }
  }

  #getSpliceFromAndSpliceDeleteCount = function(param, sliceFrom) {
    const spliceFrom = is.number(param)
            ? param
            : is.object(param)
              ? param.hasOwnProperty('to')
                ? param.to
                : sliceFrom
              : sliceFrom,
          spliceDeleteCount = is.number(param)
            ? 0
            : is.object(param)
              ? param.hasOwnProperty('deleteCount')
                ? param.deleteCount
                : 0
              : 0

    return { spliceFrom, spliceDeleteCount }
  }
}
