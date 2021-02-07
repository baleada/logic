/*
 * insertable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

import reorderable from './reorderable.js'

export default function insertable (array) {
  const insert = ({ item, items, index }) => {
    const itemsToInsert = items || [item],
          withItems = array.concat(itemsToInsert),
          inserted = reorderable(withItems).reorder({
            from: { start: array.length, itemCount: itemsToInsert.length },
            to: index
          }).value

    return insertable(inserted)
  }

  return { insert, value: array }
 }
 