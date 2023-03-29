import type { ClassValue } from 'clsx'
import clsx from 'clsx'
import type { ManyFunction } from './types'

export function createList (): ManyFunction<ClassValue, string> {
  return (...many) => clsx(...many)
}
