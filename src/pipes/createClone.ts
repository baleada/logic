
import { klona } from 'klona'
import type { AnyFunction } from './types'

export function createClone<Any> (): AnyFunction<Any> {
  return any => {
    return klona(any)
  }
}
