import type { AssociativeArray, AssociativeArrayOptions } from '../factories/createAssociativeArray'
import { createAssociativeArray } from '../factories/createAssociativeArray'

export type KeyStatuses = AssociativeArray<KeyStatusKey, KeyStatus>

// TODO: Don't store flags?
export type KeyStatusKey = {
  key?: string,
  code?: string,
  altKey?: boolean,
  ctrlKey?: boolean,
  metaKey?: boolean,
  shiftKey?: boolean,
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
