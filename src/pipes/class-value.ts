import type { ClassValue } from 'clsx'
import clsx from 'clsx'
import type { ManyTransform } from './many'

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/list)
 */
export function createList (): ManyTransform<ClassValue, string> {
  return (...classValues) => clsx(...classValues)
}
