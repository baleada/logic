import { find, findIndex } from 'lazy-collections'
import type { AssociativeArray } from '../extracted'
import { createMap } from './array'
import { createEqual } from './any'

export type AssociativeArrayTransform<Key, Value, Transformed> = (associativeArray: AssociativeArray<Key, Value>) => Transformed

export type WithPredicateKey = {
  predicateKey?: (candidate) => boolean
}

export function createValue<Key extends any, Value extends any> (
  key: Key,
  options: WithPredicateKey = {},
): AssociativeArrayTransform<Key, Value, Value | undefined> {
  const { predicateKey = createEqual(key) } = options

  return associativeArray => {
    return find<typeof associativeArray[number]>(
      ([candidate]) => predicateKey(candidate)
    )(associativeArray)?.[1]
  }
}

export function createHas<Key extends any> (
  key: Key,
  options: WithPredicateKey = {},
): AssociativeArrayTransform<Key, any, boolean> {
  const { predicateKey = createEqual(key) } = options

  return associativeArray => {
    return findIndex<typeof associativeArray[number]>(
      ([candidate]) => predicateKey(candidate)
    )(associativeArray) !== -1
  }
}

export function createKeys<Key extends any> (): AssociativeArrayTransform<Key, any, Key[]> {
  return associativeArray => {
    return createMap<typeof associativeArray[number], Key>(([key]) => key)(associativeArray)
  }
}

export function createValues<Value extends any> (): AssociativeArrayTransform<any, Value, Value[]> {
  return associativeArray => {
    return createMap<typeof associativeArray[number], Value>(([, value]) => value)(associativeArray)
  }
}
