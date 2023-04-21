import type { ObjectFn } from './types'

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
