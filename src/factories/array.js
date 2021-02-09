import toAsyncReduced from '../util/toAsyncReduced.js'
import isNumber from '../util/isNumber.js'

export default function array (state) {
  return new NormalizeableArray(...state)
}

class NormalizeableArray extends Array {
  normalize () {
    return [...this]
  }

  async asyncFilter (filter) {
    const asyncMapped = await this.asyncMap(filter)
    return array(this.filter((_, index) => asyncMapped[index]))
  }

  async asyncForEach (forEach) {
    await toAsyncReduced({
      array: this,
      reducer: async (_, ...rest) => await forEach(...rest),
    })
    
    return this
  }

  async asyncMap (map) {
    const asyncReduced = await toAsyncReduced({
      array: this,
      reducer: async (resolvedMaps, ...rest) => [...resolvedMaps, await map(...rest)],
      initialValue: []
    })
    return array(asyncReduced)
  }

  delete ({ index, item }) {
    const deleteIndex = isNumber(index) ? index : this.findIndex(element => element === item),
          deleted = [
            ...this.slice(0, deleteIndex),
            ...this.slice(deleteIndex + 1),
          ]
  
    return array(deleted)
  }

  insert ({ item, items, index }) {
    const itemsToInsert = items || [item],
          withItems = this.concat(itemsToInsert),
          inserted = array(withItems).reorder({
            from: { start: this.length, itemCount: itemsToInsert.length },
            to: index
          })

    return array(inserted)
  }

  reorder ({ from, to }) {
    const itemsToMoveStartIndex = from.start ?? from,
          itemsToMoveCount = from.itemCount ?? 1,
          insertIndex = to
          
    // Guard against item ranges that overlap the insert index. Not possible to reorder in that way.
    if (insertIndex > itemsToMoveStartIndex && insertIndex < itemsToMoveStartIndex + itemsToMoveCount) {
      return this
    }
          
    const itemsToMove = this.slice(itemsToMoveStartIndex, itemsToMoveStartIndex + itemsToMoveCount)

    let reordered
    if (itemsToMoveStartIndex < insertIndex) {
      const beforeItemsToMove = itemsToMoveStartIndex === 0 ? [] : this.slice(0, itemsToMoveStartIndex),
            betweenItemsToMoveAndInsertIndex = this.slice(itemsToMoveStartIndex + itemsToMoveCount, insertIndex + 1),
            afterInsertIndex = this.slice(insertIndex + 1)

      reordered = [
        ...beforeItemsToMove,
        ...betweenItemsToMoveAndInsertIndex,
        ...itemsToMove,
        ...afterInsertIndex,
      ]
    } else if (itemsToMoveStartIndex > insertIndex) {
      const beforeInsertion = insertIndex === 0 ? [] : this.slice(0, insertIndex),
            betweenInsertionAndItemsToMove = this.slice(insertIndex, itemsToMoveStartIndex),
            afterItemsToMove = this.slice(itemsToMoveStartIndex + itemsToMoveCount)

      reordered = [
        ...beforeInsertion,
        ...itemsToMove,
        ...betweenInsertionAndItemsToMove,
        ...afterItemsToMove,
      ]
    }
    
    return array(reordered)
  }

  replace ({ index, item }) {
    const replaced = [
            ...this.slice(0, index),
            item,
            ...this.slice(index + 1),
          ]

    return array(replaced)
  }

  unique () {
    return array([...new Set(this)])
  }
}

