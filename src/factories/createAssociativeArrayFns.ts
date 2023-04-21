import { find, findIndex } from 'lazy-collections'
import { createMap } from '../pipes'
import type { AssociativeArray, DeepRequired } from '../extracted'

export type AssociativeArrayFns<Key extends any, Value extends any> = {
  get: (key: Key) => Value | undefined,
  set: (key: Key, value: Value) => void,
  has: (key: Key) => boolean,
  clear: () => void,
  delete: (key: Key) => boolean,
  keys: () => Key[],
  values: () => Value[],
}

export type AssociativeArrayFnsOptions<Key extends any> = {
  createPredicateKey?: (query: Key) => (candidate: Key) => boolean
}

const defaultOptions: DeepRequired<AssociativeArrayFnsOptions<any>> = {
  createPredicateKey: query => candidate => query === candidate,
}

export function createAssociativeArrayFns<Key extends any, Value extends any> (
  associativeArray: AssociativeArray<Key, Value>,
  options: AssociativeArrayFnsOptions<Key> = {}
) {
  const { createPredicateKey } = ({ ...defaultOptions, ...options } as AssociativeArrayFnsOptions<Key>)

  const get: AssociativeArrayFns<Key, Value>['get'] = key => {
    const predicateKey = createPredicateKey(key)

    return find<typeof associativeArray[0]>(
      ([candidate]) => predicateKey(candidate)
    )(associativeArray)?.[1]
  }

  const set: AssociativeArrayFns<Key, Value>['set'] = (key, value) => {
    const predicateKey = createPredicateKey(key),
          index = findIndex<typeof associativeArray[0]>(
            ([candidate]) => predicateKey(candidate)
          )(associativeArray) as number

    if (index === -1) {
      associativeArray.push([key, value])
      return
    }

    associativeArray[index][1] = value
  }

  const has: AssociativeArrayFns<Key, Value>['has'] = key => {
    const predicateKey = createPredicateKey(key)

    return findIndex<typeof associativeArray[0]>(
      ([candidate]) => predicateKey(candidate)
    )(associativeArray) !== -1
  }

  const clear: AssociativeArrayFns<Key, Value>['clear'] = () => {
    associativeArray.length = 0
  }

  const del: AssociativeArrayFns<Key, Value>['delete'] = key => {
    const predicateKey = createPredicateKey(key),
          index = findIndex<typeof associativeArray[0]>(
            ([candidate]) => predicateKey(candidate)
          )(associativeArray) as number

    if (index === -1) {
      return false
    }

    associativeArray.splice(index, 1)

    return true
  }

  const keys: AssociativeArrayFns<Key, Value>['keys'] = () => {
    return createMap<typeof associativeArray[0], Key>(([key]) => key)(associativeArray)
  }

  const values: AssociativeArrayFns<Key, Value>['values'] = () => {
    return createMap<typeof associativeArray[0], Value>(([, value]) => value)(associativeArray)
  }

  return {
    get,
    set,
    has,
    clear,
    delete: del,
    keys,
    values,
  }
}
