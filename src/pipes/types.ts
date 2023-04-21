import type {
  AssociativeArray,
  Graph,
  GraphState,
  GraphVertex,
} from '../extracted'

export type AnyFn<Returned> = (param: any) => Returned

export type ManyFn<Parameter, Returned> = (...params: Parameter[]) => Returned

export type ArrayFn<Item, Returned> = (array: Item[]) => Returned

export type ArrayAsyncFn<Item, Returned> = (array: Item[]) => Promise<Returned>

export type ElementFn<El extends HTMLElement, Returned> = (element: El) => Returned

export type MapFn<Key, Value, Returned> = (transform: Map<Key, Value>) => Returned

export type NumberFn<Returned> = (number: number) => Returned

export type ObjectFn<Key extends string | number | symbol, Value, Returned> = (transform: Record<Key, Value>) => Returned

export type StringFn<Returned> = (string: string) => Returned

export type AssociativeArrayFn<Key, Value, Returned> = (associativeArray: AssociativeArray<Key, Value>) => Returned

export type GraphFn<Id extends string, Metadata, Returned> = (graph: Graph<Id, Metadata>) => Returned

export type GraphVertexFn<Id extends string, Returned> = (node: GraphVertex<Id>) => Returned

export type GraphStateFn<Id extends string, Metadata, Returned> = (state: GraphState<Id, Metadata>) => Returned
