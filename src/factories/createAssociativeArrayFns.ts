import { find, findIndex } from 'lazy-collections'
import { createMap } from '../pipes'
import type { AssociativeArray } from '../extracted'

export type AssociativeArrayFns<Key extends any, Value extends any> = {
  toValue: (key: Key) => Value | undefined,
  set: (key: Key, value: Value) => void,
  predicateHas: (key: Key) => boolean,
  clear: () => void,
  delete: (key: Key) => boolean,
  toKeys: () => Key[],
  toValues: () => Value[],
  toEntries: () => AssociativeArray<Key, Value>,
  // get: AssociativeArrayFns<Key, Value>['toValue'],
  // has: AssociativeArrayFns<Key, Value>['predicateHas'],
  // keys: AssociativeArrayFns<Key, Value>['toKeys'],
  // values: AssociativeArrayFns<Key, Value>['toValues'],
}

export type AssociativeArrayFnsOptions<Key extends any> = {
  initial?: AssociativeArray<Key, any>,
  createPredicateKey?: (query: Key) => (candidate: Key) => boolean
}

const defaultOptions: Required<AssociativeArrayFnsOptions<any>> = {
  initial: [],
  createPredicateKey: query => candidate => query === candidate,
}

export function createAssociativeArrayFns<Key extends any, Value extends any> (
  options: AssociativeArrayFnsOptions<Key> = {}
) {
  const { initial, createPredicateKey } = ({ ...defaultOptions, ...options } as AssociativeArrayFnsOptions<Key>),
        associativeArray = [...initial]

  const toValue: AssociativeArrayFns<Key, Value>['toValue'] = key => {
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

  const predicateHas: AssociativeArrayFns<Key, Value>['predicateHas'] = key => {
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

  const toKeys: AssociativeArrayFns<Key, Value>['toKeys'] = () => {
    return createMap<typeof associativeArray[0], Key>(([key]) => key)(associativeArray)
  }

  const toValues: AssociativeArrayFns<Key, Value>['toValues'] = () => {
    return createMap<typeof associativeArray[0], Value>(([, value]) => value)(associativeArray)
  }

  const toEntries: AssociativeArrayFns<Key, Value>['toEntries'] = () => {
    return [...associativeArray]
  }

  return {
    toValue,
    set,
    predicateHas,
    clear,
    delete: del,
    toKeys,
    toValues,
    toEntries,
    // get: toValue,
    // has: predicateHas,
    // keys: toKeys,
    // values: toValues,
  }
}
