import type { ObjectFn } from './types'

export function createEvery<Key extends string | number | symbol, Value>(predicate: (key: Key, value: Value) => unknown): ObjectFn<Key, Value, boolean> {
  return object => {
    for (const key in object) {
      if (!predicate(key, object[key])) {
        return false
      }
    }

    return true
  }
}
