import { find, findIndex } from 'lazy-collections'
import type { DeepRequired } from '../../extracted'
import { createMap } from '../../pipes'

export type CustomMapFns<Key extends any, Value extends any> = {
  get: (key: Key) => Value | undefined,
  set: (key: Key, value: Value) => void,
  has: (key: Key) => boolean,
  clear: () => void,
  delete: (key: Key) => boolean,
  keys: () => Key[],
  values: () => Value[],
}

export type CustomMap<Key extends any, Value extends any> = CustomMapTuple<Key, Value>[]

type CustomMapTuple<Key extends any, Value extends any> = [Key, Value]

export type CustomMapFnsOptions<Key extends any> = {
  createPredicateKey?: (query: Key) => (candidate: Key) => boolean
}

const defaultOptions: DeepRequired<CustomMapFnsOptions<any>> = {
  createPredicateKey: query => candidate => query === candidate,
}

export function createCustomMapFns<Key extends any, Value extends any> (
  customMap: CustomMap<Key, Value>,
  options: CustomMapFnsOptions<Key> = {}
) {
  const { createPredicateKey } = ({ ...defaultOptions, ...options } as CustomMapFnsOptions<Key>)

  const get: CustomMapFns<Key, Value>['get'] = key => {
    const predicateKey = createPredicateKey(key)

    return find<CustomMapTuple<Key, Value>>(
      ([candidate]) => predicateKey(candidate)
    )(customMap)?.[1]
  }

  const set: CustomMapFns<Key, Value>['set'] = (key, value) => {
    const predicateKey = createPredicateKey(key),
          index = findIndex<CustomMapTuple<Key, Value>>(
            ([candidate]) => predicateKey(candidate)
          )(customMap) as number

    if (index === -1) {
      customMap.push([key, value])
      return
    }

    customMap[index][1] = value
  }

  const has: CustomMapFns<Key, Value>['has'] = key => {
    const predicateKey = createPredicateKey(key)

    return findIndex<CustomMapTuple<Key, Value>>(
      ([candidate]) => predicateKey(candidate)
    )(customMap) !== -1
  }

  const clear: CustomMapFns<Key, Value>['clear'] = () => {
    customMap.length = 0
  }

  const del: CustomMapFns<Key, Value>['delete'] = key => {
    const predicateKey = createPredicateKey(key),
          index = findIndex<CustomMapTuple<Key, Value>>(
            ([candidate]) => predicateKey(candidate)
          )(customMap) as number

    if (index === -1) {
      return false
    }

    customMap.splice(index, 1)

    return true
  }

  const keys: CustomMapFns<Key, Value>['keys'] = () => {
    return createMap<CustomMapTuple<Key, Value>, Key>(([key]) => key)(customMap)
  }

  const values: CustomMapFns<Key, Value>['values'] = () => {
    return createMap<CustomMapTuple<Key, Value>, Value>(([, value]) => value)(customMap)
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
