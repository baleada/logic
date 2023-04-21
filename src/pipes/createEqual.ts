import { dequal } from 'dequal'
import type { AnyFn } from './types'

export function createEqual(compared: any): AnyFn<boolean> {
  return any => dequal(any, compared)
}
