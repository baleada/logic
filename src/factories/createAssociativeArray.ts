import { find, findIndex } from 'lazy-collections'
import { createMap } from '../pipes'
import type { AssociativeArrayEntries } from '../extracted'

export type AssociativeArray<Key extends any, Value extends any> = {
  toValue: (key: Key) => Value | undefined,
  set: (key: Key, value: Value) => void,
  predicateHas: (key: Key) => boolean,
  clear: () => void,
  delete: (key: Key) => boolean,
  toKeys: () => Key[],
  toValues: () => Value[],
  toEntries: () => AssociativeArrayEntries<Key, Value>,
  // get: AssociativeArrayFns<Key, Value>['toValue'],
  // has: AssociativeArrayFns<Key, Value>['predicateHas'],
  // keys: AssociativeArrayFns<Key, Value>['toKeys'],
  // values: AssociativeArrayFns<Key, Value>['toValues'],
}

export type AssociativeArrayOptions<Key extends any> = {
  initial?: AssociativeArrayEntries<Key, any>,
  createPredicateKey?: (query: Key) => (candidate: Key) => boolean
}

const defaultOptions: Required<AssociativeArrayOptions<any>> = {
  initial: [],
  createPredicateKey: query => candidate => query === candidate,
}

export function createAssociativeArray<Key extends any, Value extends any> (
  options: AssociativeArrayOptions<Key> = {}
) {
  const { initial, createPredicateKey } = ({ ...defaultOptions, ...options } as AssociativeArrayOptions<Key>),
        entries = [...initial]

  const toValue: AssociativeArray<Key, Value>['toValue'] = key => {
    const predicateKey = createPredicateKey(key)

    return find<typeof entries[number]>(
      ([candidate]) => predicateKey(candidate)
    )(entries)?.[1]
  }

  const set: AssociativeArray<Key, Value>['set'] = (key, value) => {
    const predicateKey = createPredicateKey(key),
          index = findIndex<typeof entries[number]>(
            ([candidate]) => predicateKey(candidate)
          )(entries) as number

    if (index === -1) {
      entries.push([key, value])
      return
    }

    entries[index][1] = value
  }

  const predicateHas: AssociativeArray<Key, Value>['predicateHas'] = key => {
    const predicateKey = createPredicateKey(key)

    return findIndex<typeof entries[number]>(
      ([candidate]) => predicateKey(candidate)
    )(entries) !== -1
  }

  const clear: AssociativeArray<Key, Value>['clear'] = () => {
    entries.length = 0
  }

  const del: AssociativeArray<Key, Value>['delete'] = key => {
    const predicateKey = createPredicateKey(key),
          index = findIndex<typeof entries[number]>(
            ([candidate]) => predicateKey(candidate)
          )(entries) as number

    if (index === -1) {
      return false
    }

    entries.splice(index, 1)

    return true
  }

  const toKeys: AssociativeArray<Key, Value>['toKeys'] = () => {
    return createMap<typeof entries[number], Key>(([key]) => key)(entries)
  }

  const toValues: AssociativeArray<Key, Value>['toValues'] = () => {
    return createMap<typeof entries[number], Value>(([, value]) => value)(entries)
  }

  const toEntries: AssociativeArray<Key, Value>['toEntries'] = () => {
    return entries
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
