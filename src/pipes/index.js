import toAsyncReduced from '../util/toAsyncReduced.js'
import isNumber from '../util/isNumber.js'
import slugify from '@sindresorhus/slugify'

// ARRAY
export function createAsyncFilter (filter) {
  return async array => {
    const asyncMapped = await createAsyncMap(filter)(array)
    return array.filter((_, index) => asyncMapped[index])
  }
}

export function createAsyncForEach (forEach) {
  return async array => {
    await toAsyncReduced({
      array,
      reducer: async (_, ...rest) => await forEach(...rest),
    })
    
    return array
  }
}

export function createAsyncMap (map) {
  return async array => {
    return await toAsyncReduced({
      array: array,
      reducer: async (resolvedMaps, ...rest) => [...resolvedMaps, await map(...rest)],
      initialValue: []
    })
  }
}

export function createDelete ({ index, item }) {
  return array => {
    const deleteIndex = isNumber(index) ? index : array.findIndex(element => element === item),
          deleted = [
            ...array.slice(0, deleteIndex),
            ...array.slice(deleteIndex + 1),
          ]
  
    return deleted
  }
}

export function createInsert ({ item, items, index }) {
  return array => {
    const itemsToInsert = items || [item],
          withItems = array.concat(itemsToInsert)

    return createReorder({
      from: { start: array.length, itemCount: itemsToInsert.length },
      to: index
    })(withItems)
  }
}

export function createReorder ({ from, to }) {
  return array => {
    const itemsToMoveStartIndex = from.start ?? from,
          itemsToMoveCount = from.itemCount ?? 1,
          insertIndex = to
    
    // Guard against item ranges that overlap the insert index. Not possible to reorder in that way.
    if (insertIndex > itemsToMoveStartIndex && insertIndex < itemsToMoveStartIndex + itemsToMoveCount) {
      return array
    }
        
    const itemsToMove = array.slice(itemsToMoveStartIndex, itemsToMoveStartIndex + itemsToMoveCount)

    const reordered = (() => {
      if (itemsToMoveStartIndex < insertIndex) {
        const beforeItemsToMove = itemsToMoveStartIndex === 0 ? [] : array.slice(0, itemsToMoveStartIndex),
              betweenItemsToMoveAndInsertIndex = array.slice(itemsToMoveStartIndex + itemsToMoveCount, insertIndex + 1),
              afterInsertIndex = array.slice(insertIndex + 1)
    
        return [
          ...beforeItemsToMove,
          ...betweenItemsToMoveAndInsertIndex,
          ...itemsToMove,
          ...afterInsertIndex,
        ]
      }
      
      if (itemsToMoveStartIndex > insertIndex) {
        const beforeInsertion = insertIndex === 0 ? [] : array.slice(0, insertIndex),
              betweenInsertionAndItemsToMove = array.slice(insertIndex, itemsToMoveStartIndex),
              afterItemsToMove = array.slice(itemsToMoveStartIndex + itemsToMoveCount)
    
        return [
          ...beforeInsertion,
          ...itemsToMove,
          ...betweenInsertionAndItemsToMove,
          ...afterItemsToMove,
        ]
      }

      return array
    })()

    return reordered
  }
}

export function createReplace ({ index, item }) {
  return array => {
    return [
      ...array.slice(0, index),
      item,
      ...array.slice(index + 1),
    ]
  }
}

export function createUnique () {
  return array => {
    return [...new Set(array)]
  }
}


// STRING
export function createSlug (...args) {
  return string => {
    return slugify(string, ...args)
  }
}

export function createClip (clipTextOrClipRE) {
  return string => {
    return string.replace(clipTextOrClipRE, '')
  }
}


// NUMBER
export function createClamp ({ min, max }) {
  return number => {
    const maxed = Math.max(number, min)
    return Math.min(maxed, max)
  }
}


// MAP
export function createRename ({ from, to }) {
  return map => {
    const keys = [...map.keys()],
          keyToRenameIndex = keys.findIndex(k => k === from),
          newKeys = createReplace({ index: keyToRenameIndex, item: to })(keys),
          values = [...map.values()]

    return newKeys.reduce((renamed, key, index) => renamed.set(key, values[index]), new Map())
  }
}


// PIPEABLE
export function pipeable (state) {
  return new Pipeable(state)
}

class Pipeable {
  constructor (state) {
    this.state = state
  }

  pipe (...fns) {
    return fns.reduce((piped, fn, ...rest) => fn(piped, ...rest), this.state)
  }

  async asyncPipe (...fns) {
    return await toAsyncReduced({
      array: fns,
      reducer: async (piped, fn, ...rest) => await fn(piped, ...rest),
      initialValue: this.state
    })
  }
}
