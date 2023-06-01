import type { AssociativeArray } from '../factories'

export type AssociativeArrayFn<Key, Value, Returned> = (associativeArray: AssociativeArray<Key, Value>) => Returned
