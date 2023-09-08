import type { ClassValue } from 'clsx'
import clsx from 'clsx'
import type { ManyTransform } from './many'

export function createList (): ManyTransform<ClassValue, string> {
  return (...classValues) => clsx(...classValues)
}
