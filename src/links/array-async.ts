export type ArrayAsyncEffect<Item> = (array: Item[]) => Promise<Item[]>

export function createForEachAsync<Item>(effect: (item: Item, index: number) => any): ArrayAsyncEffect<Item> {
  return async array => {
    for (let i = 0; i < array.length; i++) {
      const item = array[i]
      await effect(item, i)
    }

    return array
  }
}
