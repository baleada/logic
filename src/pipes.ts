import {
  pipe,
  slice,
  toArray,
  findIndex,
  find,
  concat,
  filter,
  map,
  unique,
  reduce,
} from 'lazy-collections'
import slugify from '@sindresorhus/slugify'
import type { Options as SlugifyOptions } from '@sindresorhus/slugify'

// REDUCE
export function createReduceAsync<Item, Accumulator> (
  accumulate: (accumulator?: Accumulator, item?: Item, index?: number) => Promise<Accumulator>,
  initialValue?: Accumulator
): (array: Item[]) => Promise<Accumulator> {
  return async array => {
    return await reduce<Promise<Accumulator>, Item>(
      async (accumulatorPromise, item, index) => {
        const accumulator = await accumulatorPromise
        return accumulate(accumulator, item, index)
      },
      Promise.resolve(initialValue)
    )(array)
  }
}

export function createReduce<Item, Accumulator> (
  accumulate: (accumulator?: Accumulator, item?: Item, index?: number) => Accumulator,
  initialValue?: Accumulator
): (array: Item[]) => Accumulator {
  return array => reduce<Accumulator, Item>(accumulate, initialValue)(array) as Accumulator
}

// ARRAY ASYNC
export type ArrayFunctionAsync<Item, Returned> = (array: Item[]) => Promise<Returned>

export function createForEachAsync<Item> (forEach: (item?: Item, index?: number) => any): ArrayFunctionAsync<Item, any> {
  return async array => {
    await createReduceAsync<Item, any>(async (_, item, index) => await forEach(item, index))(array)
    return array
  }
}

export function createMapAsync<Item, Mapped> (transform: (item?: Item, index?: number) => Promise<Mapped>): ArrayFunctionAsync<Item, Mapped[]> {
  return async array => {
    return await createReduceAsync<Item, Mapped[]>(
      async (resolvedMaps, item, index) => {
        const transformed = await transform(item, index)
        resolvedMaps.push(transformed)
        return resolvedMaps
      },
      []
    )(array)
  }
}

export function createFilterAsync<Item> (condition: (item?: Item, index?: number) => Promise<boolean>): ArrayFunctionAsync<Item, Item[]> {
  return async array => {
    const transformedAsync = await createMapAsync<Item, boolean>(condition)(array)
    return createFilter<Item>((_, index) => transformedAsync[index])(array)
  }
}

// ARRAY
export type ArrayFunction<Item, Returned> = (array: Item[]) => Returned

export function createDelete<Item> (required: { index: number } | { item: Item }): ArrayFunction<Item, Item[]> {
  return array => {
    const deleteIndex = 'index' in required 
      ? required.index
      : findIndex<Item>(element => element === required?.item)(array) as number
    
    return createConcat(
      createSlice<Item>({ from: 0, to: deleteIndex })(array),
      createSlice<Item>({ from: deleteIndex + 1 })(array)
    )([])
  }
}

export function createInsert<Item> (required: ({ item: Item } | { items: Item[] }) & { index: number }): ArrayFunction<Item, Item[]> {
  return array => {
    const itemsToInsert = 'items' in required ? required.items : [required.item],
          withItems = createConcat(array, itemsToInsert)([])

    return createReorder<Item>({
      from: { start: array.length, itemCount: itemsToInsert.length },
      to: required.index
    })(withItems)
  }
}

export function createReorder<Item> (
  { from, to }: {
    from: { start: number, itemCount: number } | number,
    to: number
  }
): ArrayFunction<Item, Item[]> {
  return array => {
    const [itemsToMoveStartIndex, itemsToMoveCount] = isObject(from)
            ? [from.start, from.itemCount]
            : [from, 1],
          insertIndex = to
    
    // Guard against item ranges that overlap the insert index. Not possible to reorder in that way.
    if (insertIndex > itemsToMoveStartIndex && insertIndex < itemsToMoveStartIndex + itemsToMoveCount) {
      return array
    }

    const itemsToMove = createSlice<Item>({ from: itemsToMoveStartIndex, to: itemsToMoveStartIndex + itemsToMoveCount })(array)

    if (itemsToMoveStartIndex < insertIndex) {
      const beforeItemsToMove = itemsToMoveStartIndex === 0 ? [] : createSlice<Item>({ from: 0, to: itemsToMoveStartIndex })(array),
            betweenItemsToMoveAndInsertIndex = createSlice<Item>({ from: itemsToMoveStartIndex + itemsToMoveCount, to: insertIndex + 1 })(array),
            afterInsertIndex = createSlice<Item>({ from: insertIndex + 1 })(array)
  
      return createConcat<Item>(
        beforeItemsToMove,
        betweenItemsToMoveAndInsertIndex,
        itemsToMove,
        afterInsertIndex,
      )([])
    }
    
    if (itemsToMoveStartIndex > insertIndex) {
      const beforeInsertion = insertIndex === 0 ? [] : createSlice<Item>({ from: 0, to: insertIndex })(array),
            betweenInsertionAndItemsToMove = createSlice<Item>({ from: insertIndex, to: itemsToMoveStartIndex })(array),
            afterItemsToMove = createSlice<Item>({ from: itemsToMoveStartIndex + itemsToMoveCount })(array)
  
      return createConcat<Item>(
        beforeInsertion,
        itemsToMove,
        betweenInsertionAndItemsToMove,
        afterItemsToMove
      )([])
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
    return createConcat<Item>(
      createSlice<Item>({ from: 0, to: index })(array),
      [item],
      createSlice<Item>({ from: index + 1 })(array)
    )([])
  }
}

export function createUnique<Item> (): ArrayFunction<Item, Item[]> {
  return array => pipe(
    unique(),
    toArray()
  )(array) as Item[]
}

export function createSlice<Item> ({ from, to }: { from: number, to?: number }): ArrayFunction<Item, Item[]> {
  return array => {
    return from === to
      ? []
      : pipe(
          slice(from, to - 1),
          toArray()
        )(array) as Item[]
  }
}

export function createFilter<Item> (condition: (item?: Item, index?: number) => boolean): ArrayFunction<Item, Item[]> {
  return array => pipe(
    filter(condition),
    toArray()
  )(array) as Item[]
}

export function createMap<Item, Transformed = Item> (transform: (item?: Item, index?: number) => Transformed): ArrayFunction<Item, Transformed[]> {
  return array => pipe(
    map(transform),
    toArray()
  )(array) as Transformed[]
}

export function createConcat<Item> (...arrays: Item[][]): ArrayFunction<Item, Item[]> {
  return array => pipe(
    concat(array, ...arrays),
    toArray<Item>()
  )() as Item[]
}

export function createReverse<Item> (): ArrayFunction<Item, Item[]> {
  return array => {
    const reversed = []

    for (let i = array.length - 1; i > -1; i--) {
      reversed.push(array[i])
    }
    
    return reversed
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

type Potentiality<Outcome> = { outcome: Outcome, probability: number }

export function createDetermine<Outcome> (potentialities: Potentiality<Outcome>[]): NumberFunction<Outcome> {
  type Predicate = { outcome: Outcome, predicate: (determinant: number) => boolean }

  const predicates = createMap<Potentiality<Outcome>, Predicate>(({ outcome, probability }, index) => {
          const lowerBound: number = index === 0
                  ? 0
                  : pipe(
                    slice<Potentiality<Outcome>>(0, index - 1),
                    reduce<number, Potentiality<Outcome>>((lowerBound, { probability }) => lowerBound + probability, 0)
                  )(potentialities),
                upperBound = lowerBound + probability

          return {
            outcome,
            predicate: determinant => 
              (determinant >= lowerBound && determinant < upperBound)
              || determinant < 0 && index === 0
              || index === predicates.length - 1
          }
        })(potentialities)

  return determinant => (find<Predicate>(({ predicate }) => predicate(determinant))(predicates) as Predicate).outcome
}


// MAP
export type MapFunction<Key, Value, Returned> = (transform: Map<Key, Value>) => Returned

export function createRename<Key, Value> ({ from, to }: { from: Key, to: Key }): MapFunction<Key, Value, Map<Key, Value>> {
  return map => {
    const keys = [...map.keys()],
          keyToRenameIndex = findIndex(k => k === from)(keys) as number,
          newKeys = createReplace({ index: keyToRenameIndex, item: to })(keys),
          values = [...map.values()]

    return createReduce<Key, Map<Key, Value>>((renamed, key, index) => renamed.set(key, values[index]), new Map())(newKeys)
  }
}


// OBJECT
export type ObjectFunction<Key extends string | number | symbol, Value, Returned> = (transform: Record<Key, Value>) => Returned

// Preferable to Object.entries for type safety
export function createToEntries<Key extends string | number | symbol, Value> (): ObjectFunction<Key, Value, [Key, Value][]> {
  return object => {
    const entries = []

    for (const key in object) {
      entries.push([key, object[key]])
    }

    return entries
  }
}


// PIPEABLE
export class Pipeable {
  constructor (private state: any) {}

  pipe (...fns: ((...args: any[]) => any)[]) {
    return createReduce<(...args: any[]) => any, any>((piped, fn, index) => fn(piped, index), this.state)(fns)
  }

  async pipeAsync (...fns: ((...args: any[]) => Promise<any>)[]): Promise<any> {
    return await createReduceAsync<any, any>(
      async (piped, fn, index) => await fn(piped, index),
      this.state
    )(fns)
  }
}
