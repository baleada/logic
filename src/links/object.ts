export type ObjectEffect<Key extends string | number | symbol, Value> = (object: Record<Key, Value>) => Record<Key, Value>

/**
 * [Docs](https://baleada.dev/docs/logic/links/set)
 */
export function createSet<Key extends string | number | symbol, Value extends any> (
  key: Key,
  value: Value,
): ObjectEffect<Key, Value> {
  return object => {
    object[key] = value
    return object
  }
}

/**
 * [Docs](https://baleada.dev/docs/logic/links/delete)
 */
export function createDelete<Key extends string | number | symbol, Value extends any> (key: Key): ObjectEffect<Key, Value> {
  return object => {
    delete object[key]
    return object
  }
}

/**
 * [Docs](https://baleada.dev/docs/logic/links/clear)
 */
export function createClear<Key extends string | number | symbol, Value extends any> (): ObjectEffect<Key, Value> {
  return object => {
    for (const key in object) {
      delete object[key]
    }
    return object
  }
}
