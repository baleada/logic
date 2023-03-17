import type { ArrayFunction } from './types'

export function createReverse<Item>(): ArrayFunction<Item, Item[]> {
  return array => {
    const reversed = []

    for (let i = array.length - 1; i > -1; i--) {
      reversed.push(array[i])
    }

    return reversed
  }
}
