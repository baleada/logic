import { pipe, toArray, map } from 'lazy-collections'

import type { ArrayFunction } from './types'
export function createMap<Item, Transformed = Item>(transform: (item: Item, index: number) => Transformed): ArrayFunction<Item, Transformed[]> {
  return array => pipe(
    map(transform),
    toArray()
  )(array) as Transformed[];
}
