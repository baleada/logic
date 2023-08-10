// Many of these functions are preferable to Object.<something> for better type inference
// on objects with no risk of type-unsafe keys being added dynamically

type ObjectTransform<Key extends string | number | symbol, Value, Transformed> = (transform: Record<Key, Value>) => Transformed

export function createValue<Key extends string | number | symbol, Value>(key: Key): ObjectTransform<Key, Value, Value | undefined> {
  return object => object[key]
}

export function createHas<Key extends string | number | symbol>(key: Key): ObjectTransform<Key, any, boolean> {
  return object => key in object
}

export function createKeys<Key extends string | number | symbol>(): ObjectTransform<Key, any, Key[]> {
  return object => {
    const keys = []

    for (const key in object) {
      keys.push(key)
    }

    return keys
  }
}

export function createValues<Key extends string | number | symbol, Value>(): ObjectTransform<Key, Value, Value[]> {
  return object => {
    const values = []

    for (const key in object) {
      values.push(object[key])
    }

    return values
  }
}

export function createEntries<Key extends string | number | symbol, Value>(): ObjectTransform<Key, Value, [Key, Value][]> {
  return object => {
    const entries = []

    for (const key in object) {
      entries.push([key, object[key]])
    }

    return entries
  }
}

export function createEvery<Key extends string | number | symbol, Value>(predicate: (key: Key, value: Value) => unknown): ObjectTransform<Key, Value, boolean> {
  return object => {
    for (const key in object) {
      if (!predicate(key, object[key])) {
        return false
      }
    }

    return true
  }
}

export function createSome<Key extends string | number | symbol, Value>(predicate: (key: Key, value: Value) => unknown): ObjectTransform<Key, Value, boolean> {
  return object => {
    for (const key in object) {
      if (predicate(key, object[key])) return true
    }

    return false
  }
}
