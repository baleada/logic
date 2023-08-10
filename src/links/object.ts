export type ObjectEffect<Key extends string | number | symbol, Value> = (object: Record<Key, Value>) => Record<Key, Value>

export function createSet<Key extends string | number | symbol, Value extends any> (
  key: Key,
  value: Value,
): ObjectEffect<Key, Value> {
  return object => {
    object[key] = value
    return object
  }
}

export function createDelete<Key extends string | number | symbol, Value extends any> (key: Key): ObjectEffect<Key, Value> {
  return object => {
    delete object[key]
    return object
  }
}

export function createClear<Key extends string | number | symbol, Value extends any> (): ObjectEffect<Key, Value> {
  return object => {
    for (const key in object) {
      delete object[key]
    }
    return object
  }
}
