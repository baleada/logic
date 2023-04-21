import type { NumberFn } from './types'

export function createClamp(min: number, max: number): NumberFn<number> {
  return number => {
    const maxed = Math.max(number, min)
    return Math.min(maxed, max)
  }
}
