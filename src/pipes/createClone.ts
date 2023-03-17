
import { klona } from 'klona'
import type { AnyFunction } from './types'

export function createClone<Any> (kind: 'serializable' | 'deep' = 'serializable'): AnyFunction<Any> {
  switch (kind) {
    case 'serializable':
      return any => {
        return JSON.parse(JSON.stringify(any))
      }
    case 'deep':
      return any => {
        return klona(any)
      }
  }
}
