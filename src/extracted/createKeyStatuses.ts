import { includes } from 'lazy-collections'
import type { AssociativeArray, AssociativeArrayOptions } from '../factories'
import { createAssociativeArray } from '../factories'

export type KeyStatuses = AssociativeArray<KeyStatusKey, KeyStatus>

export type KeyStatusKey = {
  key?: string,
  code?: string,
}

export type KeyStatus = 'down' | 'up'

export type KeyStatusesOptions = Pick<AssociativeArrayOptions<KeyStatusKey>, 'initial'>

const defaultOptions: Required<KeyStatusesOptions> = {
  initial: [],
}

export function createKeyStatuses (options: KeyStatusesOptions = {}) {
  return createAssociativeArray<KeyStatusKey, KeyStatus>({
    ...defaultOptions,
    ...options,
    createPredicateKey: query => key => {
      for (const prop in query) {
        if (query[prop] !== key[prop]) {
          return false
        }
      }

      return true
    },
  })
}

export function predicateDown (status: KeyStatus) {
  return status === 'down'
}

export function predicateSomeKeyDown (statuses: KeyStatuses) {
  return includes<string>('down')(statuses.toValues()) as boolean
}
