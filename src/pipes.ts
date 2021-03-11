import { isObject } from './util'
import slugify from '@sindresorhus/slugify'

// Miscellaneous
export type CreateReduceAsync = (required: CreateReduceAsyncRequired, options?: CreateReduceAsyncOptions) => (array: any[]) => Promise<any>
export type CreateReduceAsyncRequired = (accumulator?: any, item?: any, index?: number, array?: any[]) => Promise<any>
export type CreateReduceAsyncOptions = any

export const createReduceAsync: CreateReduceAsync = (reduce, initialValue) => {
  return async array => {
    return await array.reduce(async (accumulator, item, index, a) => {
      const reduced = await accumulator
      return reduce(reduced, item, index, a)
    }, Promise.resolve(initialValue))
  }
}

export type ArrayAsyncFunction = (array: any[]) => Promise<any[]>

export type CreateForEachAsync = (required: CreateForEachAsyncRequired) => ArrayAsyncFunction
export type CreateForEachAsyncRequired = (item?: any, index?: number, array?: any[]) => any

export const createForEachAsync: CreateForEachAsync = forEach => {
  return async array => {
    await createReduceAsync(async (_, item, index, a) => await forEach(item, index, a))(array)
    return array
  }
}

export type CreateMapAsync = (required: CreateMapAsyncRequired) => ArrayAsyncFunction
export type CreateMapAsyncRequired = (item?: any, index?: number, array?: any[]) => any

export const createMapAsync: CreateMapAsync = map => {
  return async array => {
    return await createReduceAsync(
      async (resolvedMaps, item, index, a) => [...resolvedMaps, await map(item, index, a)],
      []
    )(array)
  }
}

export type CreateFilterAsync = (required: CreateFilterAsyncRequired) => ArrayAsyncFunction
export type CreateFilterAsyncRequired = (item?: any, index?: number, array?: any[]) => boolean

export const createFilterAsync: CreateFilterAsync = filter => {
  return async array => {
    const mappedAsync = await createMapAsync(filter)(array)
    return array.filter((_, index) => mappedAsync[index])
  }
}

export type ArrayFunction = (array: any[]) => any

export type CreateDelete = (required: CreateDeleteRequired) => ArrayFunction
export type CreateDeleteRequired = { index: number } | { item: any }

export const createDelete: CreateDelete = required => {
  return array => {
    const deleteIndex = 'index' in required ? required.index : array.findIndex(element => element === required?.item),
          deleted = [
            ...array.slice(0, deleteIndex),
            ...array.slice(deleteIndex + 1),
          ]
  
    return deleted
  }
}

export type CreateInsert = (required: CreateInsertRequired) => ArrayFunction
export type CreateInsertRequired = ({ item: any } | { items: any[] }) & { index: number }

export const createInsert: CreateInsert = required => {
  return array => {
    const itemsToInsert = 'items' in required ? required.items : [required.item],
          withItems = array.concat(itemsToInsert)

    return createReorder({
      from: { start: array.length, itemCount: itemsToInsert.length },
      to: required.index
    })(withItems)
  }
}

export type CreateReorder = (required: CreateReorderRequired) => ArrayFunction
export type CreateReorderRequired = {
    from: { start: number, itemCount: number } | number,
    to: number
  }

export const createReorder: CreateReorder = ({ from, to }) => {
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

export type CreateReplace = (required: CreateReplaceRequired) => ArrayFunction
export type CreateReplaceRequired = { index: number, item: any }

export const createReplace: CreateReplace = ({ index, item }) => {
  return array => {
    return [
      ...array.slice(0, index),
      item,
      ...array.slice(index + 1),
    ]
  }
}

export type CreateUnique = () => ArrayFunction

export const createUnique: CreateUnique = () => {
  return array => {
    return [...new Set(array)]
  }
}


// STRING
export type StringFunction = (string: string) => any

export type CreateSlug = (options?: CreateSlugOptions) => StringFunction
export type CreateSlugOptions = slugify.Options

export const createSlug: CreateSlug = (...options) => {
  return string => {
    return slugify(string, ...options)
  }
}

export type CreateClip = (required: CreateClipRequired) => StringFunction
export type CreateClipRequired = string | RegExp

export const createClip: CreateClip = (clipTextOrClipRE) => {
  return string => {
    return string.replace(clipTextOrClipRE, '')
  }
}


// NUMBER
export type NumberFunction = (number: number) => any

export type CreateClamp = (required: CreateClampRequired) => NumberFunction
export type CreateClampRequired = { min: number, max: number }

export const createClamp: CreateClamp = ({ min, max }) => {
  return number => {
    const maxed = Math.max(number, min)
    return Math.min(maxed, max)
  }
}


// MAP
export type MapFunction = (map: Map<any, any>) => any

export type CreateRename = (required: CreateRenameRequired) => MapFunction
export type CreateRenameRequired = { from: any, to: any }

export const createRename: CreateRename = ({ from, to }) => {
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
  _state: any

  constructor (state) {
    this._state = state
  }

  pipe (...fns: Function[]) {
    return fns.reduce((piped, fn, ...rest) => fn(piped, ...rest), this._state)
  }

  async pipeAsync (...fns: ((...args: any[]) => Promise<any>)[]) {
    return await createReduceAsync(
      async (piped, fn, ...rest) => await fn(piped, ...rest),
      this._state
    )(fns)
  }
}
