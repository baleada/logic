import { findIndex } from 'lazy-collections'
import { createReduce, createReplace } from './array'

export type MapFn<Key, Value, Returned> = (transform: Map<Key, Value>) => Returned

export function createRename<Key, Value>(from: Key, to: Key): MapFn<Key, Value, Map<Key, Value>> {
  return map => {
    const keys = [...map.keys()], keyToRenameIndex = findIndex(k => k === from)(keys) as number, newKeys = createReplace(keyToRenameIndex, to)(keys), values = [...map.values()]

    return createReduce<Key, Map<Key, Value>>((renamed, key, index) => renamed.set(key, values[index]), new Map())(newKeys)
  }
}
