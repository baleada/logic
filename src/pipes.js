import { isObject } from './util.js'
import slugify from '@sindresorhus/slugify'

// REDUCE
/**
 * @param {(accumulator?: any, item?: any, index?: number, array?: any[]) => Promise<any>} reduce
 * @param {any} [initialValue]
 * @return {(array: any[]) => Promise<any>}
 */
export const createReduceAsync = (reduce, initialValue) => {
  return async array => {
    return await array.reduce(async (accumulator, item, index, a) => {
      const reduced = await accumulator
      return reduce(reduced, item, index, a)
    }, Promise.resolve(initialValue))
  }
}

// ARRAY ASYNC
/**
 * @typedef {(array: any[]) => Promise<any[]>} ArrayAsyncFunction
 */

/**
 * @param {(item?: any, index?: number, array?: any[]) => any} forEach
 * @return {ArrayAsyncFunction}
 */
export const createForEachAsync = forEach => {
  return async array => {
    await createReduceAsync(async (_, item, index, a) => await forEach(item, index, a))(array)
    return array
  }
}

/**
 * @param {(item?: any, index?: number, array?: any[]) => any} map
 * @return {ArrayAsyncFunction}
 */
export const createMapAsync = map => {
  return async array => {
    return await createReduceAsync(
      async (resolvedMaps, item, index, a) => [...resolvedMaps, await map(item, index, a)],
      []
    )(array)
  }
}

/**
 * @param {(item?: any, index?: number, array?: any[]) => boolean} filter
 * @return {ArrayAsyncFunction}
 */
export const createFilterAsync = filter => {
  return async array => {
    const mappedAsync = await createMapAsync(filter)(array)
    return array.filter((_, index) => mappedAsync[index])
  }
}

// ARRAY
/**
 * @typedef {(array: any[]) => any} ArrayFunction

/**
 * @param {{ index: number } | { item: any }} config
 * @return {ArrayFunction}
 */
export const createDelete = config => {
  return array => {
    const deleteIndex = 'index' in config ? config.index : array.findIndex(element => element === config?.item),
          deleted = [
            ...array.slice(0, deleteIndex),
            ...array.slice(deleteIndex + 1),
          ]
  
    return deleted
  }
}

/**
 * @param {({ item: any } | { items: any[] }) & { index: number }} config
 * @return {ArrayFunction}
 */
export const createInsert = config => {
  return array => {
    const itemsToInsert = 'items' in config ? config.items : [config.item],
          withItems = array.concat(itemsToInsert)

    return createReorder({
      from: { start: array.length, itemCount: itemsToInsert.length },
      to: config.index
    })(withItems)
  }
}

/**
 * @param {{ from: { start: number, itemCount: number } | number, to: number }} config
 * @return {ArrayFunction}
  */
export const createReorder = ({ from, to }) => {
  return array => {
    const [itemsToMoveStartIndex, itemsToMoveCount] = isObject(from)
            ? [from.start, from.itemCount]
            : [from, 1],
          insertIndex = to
    
    // Guard against item ranges that overlap the insert index. Not possible to reorder in that way.
    if (insertIndex > itemsToMoveStartIndex && insertIndex < itemsToMoveStartIndex + itemsToMoveCount) {
      return array
    }

    const itemsToMove = array.slice(itemsToMoveStartIndex, itemsToMoveStartIndex + itemsToMoveCount)

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
  }
}

/**
 * @param {{ index: number, item: any }} config
 * @return {ArrayFunction}
 */
export const createReplace = ({ index, item }) => {
  return array => {
    return [
      ...array.slice(0, index),
      item,
      ...array.slice(index + 1),
    ]
  }
}

/**
 * @return {ArrayFunction}
 */
export const createUnique = () => {
  return array => {
    return [...new Set(array)]
  }
}


// STRING
/**
 * @typedef {(string: string) => any} StringFunction
 */

/**
 * @param {slugify.Options} options
 * @return {StringFunction}
 */
export const createSlug = options => {
  return string => {
    return slugify(string, options)
  }
}

/**
 * @param {string | RegExp} stringOrRegExp
 * @return {StringFunction}
 */
export const createClip = stringOrRegExp => {
  return string => {
    return string.replace(stringOrRegExp, '')
  }
}


// NUMBER
/**
 * @typedef {(number: number) => any} NumberFunction
 */

/**
 * @param {{ min: number, max: number }} config
 * @return {NumberFunction}
 */
export const createClamp = ({ min, max }) => {
  return number => {
    const maxed = Math.max(number, min)
    return Math.min(maxed, max)
  }
}


// MAP
/**
 * @typedef {(map: Map<any, any>) => any} MapFunction
 */

/**
 * @param {{ from: any, to: any }} config
 * @return {MapFunction}
 */
export const createRename = ({ from, to }) => {
  return map => {
    const keys = [...map.keys()],
          keyToRenameIndex = keys.findIndex(k => k === from),
          newKeys = createReplace({ index: keyToRenameIndex, item: to })(keys),
          values = [...map.values()]

    return newKeys.reduce((renamed, key, index) => renamed.set(key, values[index]), new Map())
  }
}


// PIPEABLE
export class Pipeable {
  /**
   * @param {any} state
   */
  constructor (state) {
    /**
      * @type {any}
     */
    this._state = state
  }

  /**
   * @param {Function[]} fns 
   * @return any
   */
  pipe (...fns) {
    return fns.reduce((piped, fn, ...rest) => fn(piped, ...rest), this._state)
  }

  /**
   * @param {((...args: any[]) => Promise<any>)[]} fns 
   * @return Promise<any>
   */
  async pipeAsync (...fns) {
    return await createReduceAsync(
      async (piped, fn, ...rest) => await fn(piped, ...rest),
      this._state
    )(fns)
  }
}
