import type { ArrayFunctionAsync } from './types'
import { createMapAsync } from './createMapAsync'
import { createFilter } from './createFilter'

export function createFilterAsync<Item>(predicate: (item: Item, index: number) => Promise<boolean>): ArrayFunctionAsync<Item, Item[]> {
  return async (array) => {
    const transformedAsync = await createMapAsync<Item, boolean>(predicate)(array);
    return createFilter<Item>((_, index) => transformedAsync[index])(array);
  };
}
