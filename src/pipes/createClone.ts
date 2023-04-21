
import { klona } from 'klona'
import type { AnyFn } from './types'

export function createClone<Any> (): AnyFn<Any> {
  return any => {
    return klona(any)
  }
}
