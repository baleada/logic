import { findIndex } from 'lazy-collections'
import type { AssociativeArray } from '../extracted'
import { createEqual } from '../pipes'
import type { WithPredicateKey } from '../pipes/associative-array'

export type AssociativeArrayEffect<Key, Value> = (associativeArray: AssociativeArray<Key, Value>) => AssociativeArray<Key, Value>

/**
 * [Docs](https://baleada.dev/docs/logic/links/associative-array-set)
 */
export function createSet<Key extends any, Value extends any> (
  key: Key,
  value: Value,
  options: WithPredicateKey = {},
): AssociativeArrayEffect<Key, Value> {
  const { predicateKey = createEqual(key) } = options

  return associativeArray => {
    const index = findIndex<typeof associativeArray[number]>(
      ([candidate]) => predicateKey(candidate)
    )(associativeArray) as number

    if (index === -1) {
      associativeArray.push([key, value])
      return
    }

    associativeArray[index][1] = value

    return associativeArray
  }
}

/**
 * [Docs](https://baleada.dev/docs/logic/links/associative-array-clear)
 */
export function createClear<Key extends any, Value extends any> (): AssociativeArrayEffect<Key, Value> {
  return associativeArray => {
    associativeArray.length = 0
    return associativeArray
  }
}

/**
 * [Docs](https://baleada.dev/docs/logic/links/associative-array-delete)
 */
export function createDelete<Key extends any> (
  key: Key,
  options: WithPredicateKey = {},
): AssociativeArrayEffect<Key, any> {
  const { predicateKey = createEqual(key) } = options

  return associativeArray => {
    const index = findIndex<typeof associativeArray[number]>(
      ([candidate]) => predicateKey(candidate)
    )(associativeArray) as number

    if (index === -1) return associativeArray

    associativeArray.splice(index, 1)

    return associativeArray
  }
}
