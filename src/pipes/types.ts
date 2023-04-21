import type {
  AssociativeArray,
  Graph,
  GraphState,
  GraphNode,
  GraphTreeNode,
  AsyncGraph,
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

export type GraphGeneratorFn<Id extends string, Metadata, Yielded> = GeneratorFn<Graph<Id, Metadata>, Yielded>

export type AsyncGraphFn<Id extends string, Metadata, Returned> = (graph: AsyncGraph<Id, Metadata>) => Promise<Returned>

export type AsyncGraphGeneratorFn<Id extends string, Metadata, Yielded> = GeneratorFn<AsyncGraph<Id, Metadata>, Yielded>

export type AsyncGraphAsyncGeneratorFn<Id extends string, Metadata, Yielded> = AsyncGeneratorFn<AsyncGraph<Id, Metadata>, Yielded>

export type GraphNodeFn<Id extends string, Returned> = (node: GraphNode<Id>) => Returned

export type GraphNodeGeneratorFn<Id extends string, Yielded> = GeneratorFn<GraphNode<Id>, Yielded>

export type GraphNodeAsyncGeneratorFn<Id extends string, Yielded> = AsyncGeneratorFn<GraphNode<Id>, Yielded>

export type GraphNodeTupleFn<Id extends string, Returned> = (...nodes: [GraphNode<Id>, GraphNode<Id>]) => Returned

export type GraphNodeTupleGeneratorFn<Id extends string, Yielded> = (...nodes: [GraphNode<Id>, GraphNode<Id>]) => Generator<Yielded>

export type GraphNodeTupleAsyncFn<Id extends string, Returned> = (...nodes: [GraphNode<Id>, GraphNode<Id>]) => Promise<Returned>

export type GraphNodeTupleAsyncGeneratorFn<Id extends string, Yielded> = (...nodes: [GraphNode<Id>, GraphNode<Id>]) => AsyncGenerator<Yielded>

export type GraphStateFn<Id extends string, Metadata, Returned> = (state: GraphState<Id, Metadata>) => Returned

export type GraphStateAsyncFn<Id extends string, Metadata, Returned> = (state: GraphState<Id, Metadata>) => Promise<Returned>

export type GraphTreeFn<Id extends string, Returned> = (tree: GraphTreeNode<Id>[]) => Returned

export type GeneratorFn<Parameter, Yielded> = (param: Parameter) => Generator<Yielded>

export type AsyncGeneratorFn<Parameter, Yielded> = (param: Parameter) => AsyncGenerator<Yielded>
