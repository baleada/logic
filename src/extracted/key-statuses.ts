import { includes } from 'lazy-collections'
import {
  createAssociativeArrayValue,
  createAssociativeArrayValues,
} from '../pipes'
import {
  createAssociativeArraySet,
  createAssociativeArrayClear,
  createAssociativeArrayDelete,
} from '../links'
import type { AssociativeArray } from '.'

export type KeyStatuses = AssociativeArray<KeyStatusKey, KeyStatus>

export type KeyStatusKey = {
  key?: string,
  code?: string,
}

export type KeyStatus = 'down' | 'up'

export const createValue = createAssociativeArrayValue<KeyStatusKey, KeyStatus>

export function createSet (key: KeyStatusKey, value: KeyStatus) {
  return createAssociativeArraySet<KeyStatusKey, KeyStatus>(
    key,
    value,
    { predicateKey: createPredicateKey(key) }
  )
}

export const createClear = createAssociativeArrayClear<KeyStatusKey, KeyStatus>

export function createDelete (key: KeyStatusKey) {
  return createAssociativeArrayDelete<KeyStatusKey>(
    key,
    { predicateKey: createPredicateKey(key) }
  )
}

export function createPredicateKey (query: KeyStatusKey) {
  return function (candidate: KeyStatusKey) {
    for (const prop in query) {
      if (query[prop] !== candidate[prop]) {
        return false
      }
    }

    return true
  }
}

const createValues = createAssociativeArrayValues<KeyStatus>

export function predicateSomeKeyDown (statuses: KeyStatuses) {
  return includes<string>('down')(createValues()(statuses)) as boolean
}
