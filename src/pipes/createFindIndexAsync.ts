import type { ArrayFunctionAsync } from './types'

export function createFindIndexAsync<Item>(predicate: (item: Item, index: number) => Promise<boolean>): ArrayFunctionAsync<Item, number> {
  return async array => {
    for (let i = 0; i < array.length; i++) {
      const item = array[i],
            is = await predicate(item, i)
      if (is) return i
    }
  }
}
