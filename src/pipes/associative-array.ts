import { find, findIndex } from 'lazy-collections'
import type { AssociativeArray } from '../extracted'
import { createMap } from './array'
import { createEqual } from './any'

export type AssociativeArrayTransform<Key, Value, Transformed> = (associativeArray: AssociativeArray<Key, Value>) => Transformed

export type WithPredicateKey<Key extends any> = {
  predicateKey?: (candidate: Key) => boolean
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/associative-array-value)
 */
export function createValue<Key extends any, Value extends any> (
  key: Key,
  options: WithPredicateKey<Key> = {},
): AssociativeArrayTransform<Key, Value, Value | undefined> {
  const { predicateKey = createEqual(key) } = options

  return associativeArray => {
    return find<typeof associativeArray[number]>(
      ([candidate]) => predicateKey(candidate)
    )(associativeArray)?.[1]
  }
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/associative-array-has)
 */
export function createHas<Key extends any> (
  key: Key,
  options: WithPredicateKey<Key> = {},
): AssociativeArrayTransform<Key, any, boolean> {
  const { predicateKey = createEqual(key) } = options

  return associativeArray => {
    return findIndex<typeof associativeArray[number]>(
      ([candidate]) => predicateKey(candidate)
    )(associativeArray) !== -1
  }
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/associative-array-keys)
 */
export function createKeys<Key extends any> (): AssociativeArrayTransform<Key, any, Key[]> {
  return associativeArray => {
    return createMap<typeof associativeArray[number], Key>(([key]) => key)(associativeArray)
  }
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/associative-array-values)
 */
export function createValues<Value extends any> (): AssociativeArrayTransform<any, Value, Value[]> {
  return associativeArray => {
    return createMap<typeof associativeArray[number], Value>(([, value]) => value)(associativeArray)
  }
}
