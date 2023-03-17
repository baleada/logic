import { dequal } from 'dequal'
import type { AnyFunction } from './types'

export function createEqual(compared: any): AnyFunction<boolean> {
  return any => dequal(any, compared)
}
