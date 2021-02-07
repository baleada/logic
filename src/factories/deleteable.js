/*
 * deleteable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

import isNumber from '../util/isNumber.js' // Direct import to avoid circular dependency

export default function deleteable (array) {
  const del = ({ index, item }) => {
    const deleteIndex = isNumber(index) ? index : array.findIndex(element => element === item),
          deleted = [
            ...array.slice(0, deleteIndex),
            ...array.slice(deleteIndex + 1),
          ]

    return deleteable(deleted)
  }

  return { delete: del, value: array }
}
