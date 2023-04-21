import type { NumberFunction } from './types'

export function createClamp(min: number, max: number): NumberFunction<number> {
  return number => {
    const maxed = Math.max(number, min);
    return Math.min(maxed, max);
  };
}
