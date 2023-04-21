import { dequal } from 'dequal'

import type { AnyFunction } from './types'
export function createPredicateEqual(any: any): AnyFunction<boolean> {
  return param => dequal(any, param);
}
