import type { ClassValue } from 'clsx'
import clsx from 'clsx'
import type { ManyFn } from './many'

export function createList (): ManyFn<ClassValue, string> {
  return (...classValues) => clsx(...classValues)
}
