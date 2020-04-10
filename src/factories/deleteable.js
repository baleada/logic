/*
 * deleteable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

import is from '../util/is.js'

export default function deleteable (array) {
  const object = new Array(...array)

  object.delete = ({ index, item }) => {
    const deleteIndex = is.number(index) ? index : object.findIndex(element => element === item),
          deleted = [
            ...object.slice(0, deleteIndex),
            ...object.slice(deleteIndex + 1),
          ]

    return deleteable(deleted)
  }

  return object
}
