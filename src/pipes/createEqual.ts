import { dequal } from 'dequal'

import type { AnyFunction } from './types'
export function createEqual(any: any): AnyFunction<boolean> {
  return param => dequal(any, param);
}
