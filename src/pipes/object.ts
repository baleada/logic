import type { ObjectFn } from './types'

// Preferable to Object.entries for better type inference on objects
// with no risk of keys being added dynamically
export function createEntries<Key extends string | number | symbol, Value>(): ObjectFn<Key, Value, [Key, Value][]> {
  return object => {
    const entries = []

    for (const key in object) {
      entries.push([key, object[key]])
    }

    return entries
  }
}

// Preferable to Object.keys for better type inference on objects
// with no risk of keys being added dynamically
export function createKeys<Key extends string | number | symbol>(): ObjectFn<Key, any, Key[]> {
  return object => {
    const keys = []

    for (const key in object) {
      keys.push(key)
    }

    return keys
  }
}

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

export function createSome<Key extends string | number | symbol, Value>(predicate: (key: Key, value: Value) => unknown): ObjectFn<Key, Value, boolean> {
  return object => {
    for (const key in object) {
      if (predicate(key, object[key])) return true
    }

    return false
  }
}
