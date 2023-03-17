import { reduce } from 'lazy-collections'

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
