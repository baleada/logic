import { reduce } from 'lazy-collections'

export function createReduce<Item, Accumulator>(
  accumulate: (accumulator: Accumulator, item: Item, index: number) => Accumulator,
  initialValue?: Accumulator
): (array: Item[]) => Accumulator {
  return array => reduce<Accumulator, Item>(accumulate, initialValue)(array) as Accumulator
}
