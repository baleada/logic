import type { ClassValue } from 'clsx'
import clsx from 'clsx'
import type { ManyFn } from './types'

export function createList (): ManyFn<ClassValue, string> {
  return (...classValues) => clsx(...classValues)
}
