import type { ArrayFunctionAsync } from './types'
import { createReduceAsync } from './createReduceAsync'

export function createForEachAsync<Item>(forEach: (item: Item, index: number) => any): ArrayFunctionAsync<Item, any> {
  return async (array) => {
    await createReduceAsync<Item, any>(async (_, item, index) => await forEach(item, index))(array);
    return array;
  };
}
