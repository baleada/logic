export type AnyFunction<Returned> = (param: any) => Returned

export type ArrayFunction<Item, Returned> = (array: Item[]) => Returned

export type ArrayFunctionAsync<Item, Returned> = (array: Item[]) => Promise<Returned>

export type ElementFunction<El extends HTMLElement, Returned> = (element: El) => Returned

export type MapFunction<Key, Value, Returned> = (transform: Map<Key, Value>) => Returned

export type NumberFunction<Returned> = (number: number) => Returned

export type ObjectFunction<Key extends string | number | symbol, Value, Returned> = (transform: Record<Key, Value>) => Returned

export type StringFunction<Returned> = (string: string) => Returned
