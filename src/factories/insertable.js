/*
 * insertable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

import reorderable from './reorderable.js'

export default function insertable (array) {
  const object = new Array(...array)

  object.insert = ({ item, items, index }) => {
    const itemsToInsert = items || [item],
          withItems = object.concat(itemsToInsert),
          inserted = reorderable(withItems).reorder({
            from: { start: object.length, itemCount: itemsToInsert.length },
            to: index
          })

    return insertable(inserted)
  }

  return object
 }
 