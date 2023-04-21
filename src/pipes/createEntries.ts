import type { ObjectFunction } from './types'

// Preferable to Object.entries for better type inference on objects
// with no risk of keys being added dynamically
export function createEntries<Key extends string | number | symbol, Value>(): ObjectFunction<Key, Value, [Key, Value][]> {
  return object => {
    const entries = [];

    for (const key in object) {
      entries.push([key, object[key]]);
    }

    return entries;
  };
}
