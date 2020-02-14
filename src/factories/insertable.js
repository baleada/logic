/*
 * insertable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

import reorderable from './reorderable'

export default function insertable (array) {
  const object = new Array(...array)

  object.insert = ({ item, index }) => {
    const withItem = object.concat([item]),
          inserted = reorderable(withItem).reorder({ from: withItem.length - 1, to: index })

    return insertable(inserted)
  }

  return object
 }
 