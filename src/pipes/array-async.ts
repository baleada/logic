import { reduce } from 'lazy-collections'
import { createFilter } from './array'

export type ArrayAsyncTransform<Item, Transformed> = (array: Item[]) => Promise<Transformed>

export function createFilterAsync<Item>(predicate: (item: Item, index: number) => Promise<boolean>): ArrayAsyncTransform<Item, Item[]> {
  return async array => {
    const transformedAsync = await createMapAsync<Item, boolean>(predicate)(array)
    return createFilter<Item>((_, index) => transformedAsync[index])(array)
  }
}

export function createFindAsync<Item>(predicate: (item: Item, index: number) => Promise<boolean>): ArrayAsyncTransform<Item, Item | undefined> {
  return async array => {
    for (let i = 0; i < array.length; i++) {
      const item = array[i],
            is = await predicate(item, i)
      if (is) return item
    }
  }
}

export function createFindIndexAsync<Item>(predicate: (item: Item, index: number) => Promise<boolean>): ArrayAsyncTransform<Item, number> {
  return async array => {
    for (let i = 0; i < array.length; i++) {
      const item = array[i],
            is = await predicate(item, i)
      if (is) return i
    }
  }
}

export function createForEachAsync<Item>(forEach: (item: Item, index: number) => any): ArrayAsyncTransform<Item, any> {
  return async array => {
    for (let i = 0; i < array.length; i++) {
      const item = array[i]
      await forEach(item, i)
    }

    return array
  }
}

export function createMapAsync<Item, Mapped>(transform: (item: Item, index: number) => Promise<Mapped>): ArrayAsyncTransform<Item, Mapped[]> {
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

export function createReduceAsync<Item, Accumulator>(
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
