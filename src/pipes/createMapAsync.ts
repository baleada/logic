import type { ArrayFunctionAsync } from './types'

import { createReduceAsync } from './createReduceAsync'
export function createMapAsync<Item, Mapped>(transform: (item: Item, index: number) => Promise<Mapped>): ArrayFunctionAsync<Item, Mapped[]> {
  return async (array) => {
    return await createReduceAsync<Item, Mapped[]>(
      async (resolvedMaps, item, index) => {
        const transformed = await transform(item, index);
        resolvedMaps.push(transformed);
        return resolvedMaps;
      },
      []
    )(array);
  };
}
