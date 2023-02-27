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
import {
  eventMatchesKeycombo,
  eventMatchesMousecombo,
  eventMatchesPointercombo,
} from './classes/Listenable'
import {
  narrowKeycombo,
  narrowMousecombo,
  narrowPointercombo,
  predicateFocusable
} from './extracted'

// REDUCE
export function createReduceAsync<Item, Accumulator> (
  accumulate: (accumulator: Accumulator, item: Item, index: number) => Promise<Accumulator>,
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
  accumulate: (accumulator: Accumulator, item: Item, index: number) => Accumulator,
  initialValue?: Accumulator
): (array: Item[]) => Accumulator {
  return array => reduce<Accumulator, Item>(accumulate, initialValue)(array) as Accumulator
}

// ARRAY ASYNC
export type ArrayFunctionAsync<Item, Returned> = (array: Item[]) => Promise<Returned>

export function createForEachAsync<Item> (forEach: (item: Item, index: number) => any): ArrayFunctionAsync<Item, any> {
  return async array => {
    await createReduceAsync<Item, any>(async (_, item, index) => await forEach(item, index))(array)
    return array
  }
}

export function createMapAsync<Item, Mapped> (transform: (item: Item, index: number) => Promise<Mapped>): ArrayFunctionAsync<Item, Mapped[]> {
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

export function createFilterAsync<Item> (predicate: (item: Item, index: number) => Promise<boolean>): ArrayFunctionAsync<Item, Item[]> {
  return async array => {
    const transformedAsync = await createMapAsync<Item, boolean>(predicate)(array)
    return createFilter<Item>((_, index) => transformedAsync[index])(array)
  }
}

// ARRAY
export type ArrayFunction<Item, Returned> = (array: Item[]) => Returned

export function createRemove<Item> (index: number): ArrayFunction<Item, Item[]> {
  return array => {
    return createConcat(
      createSlice<Item>(0, index)(array),
      createSlice<Item>(index + 1)(array)
    )([])
  }
}

export function createInsert<Item> (item: Item, index: number): ArrayFunction<Item, Item[]> {
  return array => {
    const withItems = createConcat(array, [item])([])

    return createReorder<Item>(
      { start: array.length, itemCount: 1 },
      index
    )(withItems)
  }
}

export function createReorder<Item> (
  from: { start: number, itemCount: number } | number,
  to: number
): ArrayFunction<Item, Item[]> {
  return array => {
    const [itemsToMoveStartIndex, itemsToMoveCount] = predicateObject(from)
            ? [from.start, from.itemCount]
            : [from, 1],
          insertIndex = to
    
    // Guard against item ranges that overlap the insert index. Not possible to reorder in that way.
    if (insertIndex > itemsToMoveStartIndex && insertIndex < itemsToMoveStartIndex + itemsToMoveCount) {
      return array
    }

    const itemsToMove = createSlice<Item>(itemsToMoveStartIndex, itemsToMoveStartIndex + itemsToMoveCount)(array)

    if (itemsToMoveStartIndex < insertIndex) {
      const beforeItemsToMove = itemsToMoveStartIndex === 0 ? [] : createSlice<Item>(0, itemsToMoveStartIndex)(array),
            betweenItemsToMoveAndInsertIndex = createSlice<Item>(itemsToMoveStartIndex + itemsToMoveCount, insertIndex + 1)(array),
            afterInsertIndex = createSlice<Item>(insertIndex + 1)(array)
  
      return createConcat<Item>(
        beforeItemsToMove,
        betweenItemsToMoveAndInsertIndex,
        itemsToMove,
        afterInsertIndex,
      )([])
    }
    
    if (itemsToMoveStartIndex > insertIndex) {
      const beforeInsertion = insertIndex === 0 ? [] : createSlice<Item>(0, insertIndex)(array),
            betweenInsertionAndItemsToMove = createSlice<Item>(insertIndex, itemsToMoveStartIndex)(array),
            afterItemsToMove = createSlice<Item>(itemsToMoveStartIndex + itemsToMoveCount)(array)
  
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

function predicateObject (value: unknown): value is Record<any, any> {
  return typeof value === 'object'
}

export function createSwap<Item> (indices: [number, number]): ArrayFunction<Item, Item[]> {
  return array => {
    const { 0: from, 1: to } = indices,
          { reorderFrom, reorderTo } = ((): { reorderFrom: ArrayFunction<Item, Item[]>, reorderTo: ArrayFunction<Item, Item[]> } => {
            if (from < to) {
              return {
                reorderFrom: createReorder<Item>(from, to),
                reorderTo: createReorder<Item>(to - 1, from)
              }
            }

            if (from > to) {
              return {
                reorderFrom: createReorder<Item>(from, to),
                reorderTo: createReorder<Item>(to + 1, from)
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

export function createReplace<Item> (index: number, item: Item): ArrayFunction<Item, Item[]> {
  return array => {
    return createConcat<Item>(
      createSlice<Item>(0, index)(array),
      [item],
      createSlice<Item>(index + 1)(array)
    )([])
  }
}

export function createUnique<Item> (): ArrayFunction<Item, Item[]> {
  return array => pipe(
    unique(),
    toArray()
  )(array) as Item[]
}

export function createSlice<Item> (from: number, to?: number): ArrayFunction<Item, Item[]> {
  return array => {
    return from === to
      ? []
      : pipe(
          slice(from, to - 1),
          toArray()
        )(array) as Item[]
  }
}

export function createFilter<Item> (predicate: (item: Item, index: number) => boolean): ArrayFunction<Item, Item[]> {
  return array => pipe(
    filter(predicate),
    toArray()
  )(array) as Item[]
}

export function createMap<Item, Transformed = Item> (transform: (item: Item, index: number) => Transformed): ArrayFunction<Item, Transformed[]> {
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

export function createSort<Item> (compare?: (itemA: Item, itemB: Item) => number): ArrayFunction<Item, Item[]> {
  return array => {
    return new Pipeable(array).pipe(
      createSlice(0),
      sliced => compare ? sliced.sort(compare) : sliced.sort()
    )
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

export function createClamp (min: number, max: number): NumberFunction<number> {
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

export function createRename<Key, Value> (from: Key, to: Key): MapFunction<Key, Value, Map<Key, Value>> {
  return map => {
    const keys = [...map.keys()],
          keyToRenameIndex = findIndex(k => k === from)(keys) as number,
          newKeys = createReplace(keyToRenameIndex, to)(keys),
          values = [...map.values()]

    return createReduce<Key, Map<Key, Value>>((renamed, key, index) => renamed.set(key, values[index]), new Map())(newKeys)
  }
}


// OBJECT
export type ObjectFunction<Key extends string | number | symbol, Value, Returned> = (transform: Record<Key, Value>) => Returned

// Preferable to Object.entries for better type inference on objects
// with no risk of keys being added dynamically
export function createToEntries<Key extends string | number | symbol, Value> (): ObjectFunction<Key, Value, [Key, Value][]> {
  return object => {
    const entries = []

    for (const key in object) {
      entries.push([key, object[key]])
    }

    return entries
  }
}

// Preferable to Object.keys for better type inference on objects
// with no risk of keys being added dynamically
export function createToKeys<Key extends string | number | symbol> (): ObjectFunction<Key, any, [Key, any][]> {
  return object => {
    const keys = []

    for (const key in object) {
      keys.push(key)
    }

    return keys
  }
}

export function createToSome<Key extends string | number | symbol, Value> (predicate: (key: Key, value: Value) => unknown): ObjectFunction<Key, Value, boolean> {
  return object => {
    for (const key in object) {
      if (predicate(key, object[key])) {
        return true
      }
    }

    return false
  }
}

export function createToEvery<Key extends string | number | symbol, Value> (predicate: (key: Key, value: Value) => unknown): ObjectFunction<Key, Value, boolean> {
  return object => {
    for (const key in object) {
      if (!predicate(key, object[key])) {
        return false
      }
    }

    return true
  }
}


// EVENT
export type EventFunction<Evt extends Event, Returned> = (event: Evt) => Returned

export function createMatchesKeycombo (keycombo: string): EventFunction<KeyboardEvent, boolean> {
  return event => eventMatchesKeycombo(event, narrowKeycombo(keycombo))
}

export function createMatchesMousecombo (mousecombo: string): EventFunction<MouseEvent, boolean> {
  return event => eventMatchesMousecombo(event, narrowMousecombo(mousecombo))
}

export function createMatchesPointercombo (pointercombo: string): EventFunction<PointerEvent, boolean> {
  return event => eventMatchesPointercombo(event, narrowPointercombo(pointercombo))
}


// HTMLELEMENT
export type ElementFunction<El extends HTMLElement, Returned> = (element: El) => Returned

export function createToFocusable (order: 'first' | 'last', elementIsCandidate?: boolean): ElementFunction<HTMLElement, HTMLElement | undefined> {
  return element => {
    if (elementIsCandidate && predicateFocusable(element)) return element

    switch (order) {
      case 'first':
        for (let i = 0; i < element.children.length; i++) {
          const focusable = createToFocusable(order, true)(element.children[i] as HTMLElement);
          if (focusable) return focusable;
        }
        
        break
      case 'last':
        for (let i = element.children.length - 1; i > -1; i--) {
          const focusable = createToFocusable(order, true)(element.children[i] as HTMLElement);
          if (focusable) return focusable;
        }

        break
    }
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
