/*
 * deleteable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

import isNumber from '../util/isNumber.js' // Direct import to avoid circular dependency

export default function deleteable (array) {
  const object = new Array(...array)

  object.delete = ({ index, item }) => {
    const deleteIndex = isNumber(index) ? index : object.findIndex(element => element === item),
          deleted = [
            ...object.slice(0, deleteIndex),
            ...object.slice(deleteIndex + 1),
          ]

    return deleteable(deleted)
  }

  return object
}
