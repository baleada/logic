import { pipe } from 'lazy-collections'
import type { ArrayFunction } from './types'
import { createReorder } from './createReorder'

export function createSwap<Item>(indices: [number, number]): ArrayFunction<Item, Item[]> {
  return array => {
    const { 0: from, 1: to } = indices, { reorderFrom, reorderTo } = ((): { reorderFrom: ArrayFunction<Item, Item[]>; reorderTo: ArrayFunction<Item, Item[]>; } => {
      if (from < to) {
        return {
          reorderFrom: createReorder<Item>(from, to),
          reorderTo: createReorder<Item>(to - 1, from),
        }
      }

      if (from > to) {
        return {
          reorderFrom: createReorder<Item>(from, to),
          reorderTo: createReorder<Item>(to + 1, from),
        }
      }

      return {
        reorderFrom: array => array,
        reorderTo: array => array,
      }
    })()

    return pipe(reorderFrom, reorderTo)(array)
  }
}
