import type { ObjectFunction } from './types'

export function createSome<Key extends string | number | symbol, Value>(predicate: (key: Key, value: Value) => unknown): ObjectFunction<Key, Value, boolean> {
  return object => {
    for (const key in object) {
      if (predicate(key, object[key])) return true
    }

    return false
  }
}
