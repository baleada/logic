import { includes } from 'lazy-collections'
import {
  createValue as createAssociativeArrayValue,
  createValues as createAssociativeArrayValues,
} from '../pipes/associative-array'
import {
  createAssociativeArraySet,
  createAssociativeArrayClear,
  createAssociativeArrayDelete,
} from '../links'
import { modifiers } from './fromEventToKeyStatusCode'
import type { AssociativeArray } from './associative-array'

// This was originally written as an associative array to support
// more complex key status keys, e.g. objects that could be compared
// for deep equality.
//
// Key status keys are now strings that get compared with the default
// strict equality, so this whole thing could be refactored to a plain
// object, but I'm not doing that, because I want to leave my options open.
export type KeyStatuses = AssociativeArray<KeyStatusCode, KeyStatus>

export type KeyStatusCode = string

export type KeyStatus = 'down' | 'up'

export const createValue = createAssociativeArrayValue<KeyStatusCode, KeyStatus>

export function createSet (code: KeyStatusCode, value: KeyStatus) {
  return createAssociativeArraySet<KeyStatusCode, KeyStatus>(code, value)
}

export const createClear = createAssociativeArrayClear<KeyStatusCode, KeyStatus>

export function createDelete (code: KeyStatusCode) {
  return createAssociativeArrayDelete<KeyStatusCode>(code)
}

export function createCode (query: KeyStatusCode) {
  return function (candidate: KeyStatusCode) {
    return (
      query === candidate
      || (includes<string>(query)(modifiers) && candidate.includes(query))
      || (includes<string>(candidate)(modifiers) && query.includes(candidate))
    )
  }
}

const createValues = createAssociativeArrayValues<KeyStatus>

export function predicateSomeKeyDown (statuses: KeyStatuses) {
  return includes<string>('down')(createValues()(statuses)) as boolean
}
