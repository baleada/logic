import { findIndex } from 'lazy-collections'
import type { MapFunction } from './types'
import { createReduce } from './createReduce'
import { createReplace } from './createReplace'

export function createRename<Key, Value>(from: Key, to: Key): MapFunction<Key, Value, Map<Key, Value>> {
  return map => {
    const keys = [...map.keys()], keyToRenameIndex = findIndex(k => k === from)(keys) as number, newKeys = createReplace(keyToRenameIndex, to)(keys), values = [...map.values()];

    return createReduce<Key, Map<Key, Value>>((renamed, key, index) => renamed.set(key, values[index]), new Map())(newKeys);
  };
}
