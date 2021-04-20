import slugify from '@sindresorhus/slugify'
import type { Options as SlugifyOptions } from '@sindresorhus/slugify'

// REDUCE
export function createReduceAsync<Item, Accumulator> (
  reduce: (accumulator?: Accumulator, item?: Item, index?: number, array?: Item[]) => Promise<Accumulator>,
  initialValue?: Accumulator
): (array: Item[]) => Promise<Accumulator> {
  return async array => {
    return await array.reduce(async (accumulator, item, index, a) => {
      const reduced = await accumulator
      return reduce(reduced, item, index, a)
    }, Promise.resolve(initialValue))
  }
}

// ARRAY ASYNC
export type ArrayFunctionAsync<Item, Returned> = (array: Item[]) => Promise<Returned>

export function createForEachAsync<Item> (forEach: (item?: Item, index?: number, array?: Item[]) => any): ArrayFunctionAsync<Item, any> {
  return async array => {
    await createReduceAsync<Item, any>(async (_, item, index, a) => await forEach(item, index, a))(array)
    return array
  }
}

export function createMapAsync<Item, Mapped> (map: (item?: Item, index?: number, array?: Item[]) => Promise<Mapped>): ArrayFunctionAsync<Item, Mapped[]> {
  return async array => {
    return await createReduceAsync<Item, Mapped[]>(
      async (resolvedMaps, item, index, a) => [...resolvedMaps, await map(item, index, a)],
      []
    )(array)
  }
}

export function createFilterAsync<Item> (filter: (item?: Item, index?: number, array?: Item[]) => Promise<boolean>): ArrayFunctionAsync<Item, Item[]> {
  return async array => {
    const mappedAsync = await createMapAsync<Item, boolean>(filter)(array)
    return array.filter((_, index) => mappedAsync[index])
  }
}

// ARRAY
export type ArrayFunction<Item, Returned> = (array: Item[]) => Returned

export function createDelete<Item> (required: { index: number } | { item: Item }): ArrayFunction<Item, Item[]> {
  return array => {
    const deleteIndex = 'index' in required ? required.index : array.findIndex(element => element === required?.item),
          deleted = [
            ...array.slice(0, deleteIndex),
            ...array.slice(deleteIndex + 1),
          ]
  
    return deleted
  }
}

export function createInsert<Item> (required: ({ item: Item } | { items: Item[] }) & { index: number }): ArrayFunction<Item, Item[]> {
  return array => {
    const itemsToInsert = 'items' in required ? required.items : [required.item],
          withItems = array.concat(itemsToInsert)

    return createReorder<Item>({
      from: { start: array.length, itemCount: itemsToInsert.length },
      to: required.index
    })(withItems)
  }
}

export function createReorder<Item> ({ from, to }: { from: { start: number, itemCount: number } | number, to: number }): ArrayFunction<Item, Item[]> {
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

function isObject (value: unknown): value is Record<any, any> {
  return typeof value === 'object'
}

export function createSwap<Item> ({ indices }: { indices: [number, number] }): ArrayFunction<Item, Item[]> {
  return array => {
    const { 0: from, 1: to } = indices,
          { reorderFrom, reorderTo } = ((): { reorderFrom: ArrayFunction<Item, Item[]>, reorderTo: ArrayFunction<Item, Item[]> } => {
            if (from < to) {
              return {
                reorderFrom: createReorder<Item>({ from, to }),
                reorderTo: createReorder<Item>({ from: to - 1, to: from })
              }
            }

            if (from > to) {
              return {
                reorderFrom: createReorder<Item>({ from, to }),
                reorderTo: createReorder<Item>({ from: to + 1, to: from })
              }
            }

            return {
              reorderFrom: array => array,
              reorderTo: array => array,
            }
          })()

    return new Pipeable(array).pipe(reorderFrom, reorderTo)
  }
}

export function createReplace<Item> ({ index, item }: { index: number, item: Item }): ArrayFunction<Item, Item[]> {
  return array => {
    return [
      ...array.slice(0, index),
      item,
      ...array.slice(index + 1),
    ]
  }
}

export function createUnique<Item> (): ArrayFunction<Item, Item[]> {
  return array => {
    return [...new Set(array)]
  }
}


// STRING
export type StringFunction<Returned> = (string: string) => Returned

export function createSlug (options?: SlugifyOptions): StringFunction<string> {
  return string => {
    return slugify(string, options)
  }
}

export function createClip (required: string | RegExp): StringFunction<string> {
  return string => {
    return string.replace(required, '')
  }
}


// NUMBER
export type NumberFunction<Returned> = (number: number) => Returned

export function createClamp ({ min, max }: { min: number, max: number }): NumberFunction<number> {
  return number => {
    const maxed = Math.max(number, min)
    return Math.min(maxed, max)
  }
}


// MAP
export type MapFunction<Key, Value, Returned> = (map: Map<Key, Value>) => Returned

export function createRename<Key, Value> ({ from, to }: { from: Key, to: Key }): MapFunction<Key, Value, Map<Key, Value>> {
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
  constructor (private state: any) {}

  pipe (...fns: ((...args: any[]) => any)[]) {
    return fns.reduce((piped, fn, index) => fn(piped, index), this.state)
  }

  async pipeAsync (...fns: ((...args: any[]) => Promise<any>)[]): Promise<any> {
    return await createReduceAsync<any, any>(
      async (piped, fn, index) => await fn(piped, index),
      this.state
    )(fns)
  }
}
