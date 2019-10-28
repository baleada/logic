/*
 * Reorderable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Util */
import is from '../util/is'

export default class Reorderable extends Array {
  invoke (itemsToMoveParam, itemsDestinationParam) {
    const { sliceFrom, sliceItemCount } = this._getSliceFromAndSliceItemCount(itemsToMoveParam),
          spliceFrom = this._getSpliceFrom(itemsDestinationParam, sliceFrom),
          itemsToMove = this.slice(sliceFrom, sliceFrom + sliceItemCount),
          before = this.slice(0, sliceFrom),
          middle = this.slice(sliceFrom + sliceItemCount, spliceFrom + 1),
          after = this.slice(spliceFrom + 1),
          withItemsMoved = [
            ...before,
            ...middle,
            ...itemsToMove,
            ...after,
          ]

    return new Reorderable(...withItemsMoved)
  } // Adapted from Adam Wathan's Advanced Vue Component Design course

  /* Private methods */
  _getSliceFromAndSliceItemCount = function(param) {
    const sliceFrom = is.number(param)
            ? param
            : is.object(param)
              ? param.hasOwnProperty('start')
                ? param.start
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

  _getSpliceFrom = function(param, sliceFrom) {
    return is.number(param) ? param : sliceFrom
  }
}
