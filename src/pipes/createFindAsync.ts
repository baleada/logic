import type { ArrayFunctionAsync } from './types'

export function createFindAsync<Item>(predicate: (item: Item, index: number) => Promise<boolean>): ArrayFunctionAsync<Item, Item | undefined> {
  return async array => {
    for (let i = 0; i < array.length; i++) {
      const item = array[i],
            is = await predicate(item, i)
      if (is) return item
    }
  }
}
