import type {
  GraphState,
  GraphNode,
  AsyncGraph,
} from '../extracted'
import type { GeneratorFn } from './generator'
import type { AsyncGeneratorFn } from './generator-async'

export type AsyncGraphFn<Id extends string, Metadata, Returned> = (graph: AsyncGraph<Id, Metadata>) => Promise<Returned>

export type AsyncGraphGeneratorFn<Id extends string, Metadata, Yielded> = GeneratorFn<AsyncGraph<Id, Metadata>, Yielded>

export type AsyncGraphAsyncGeneratorFn<Id extends string, Metadata, Yielded> = AsyncGeneratorFn<AsyncGraph<Id, Metadata>, Yielded>

export type GraphNodeAsyncGeneratorFn<Id extends string, Yielded> = AsyncGeneratorFn<GraphNode<Id>, Yielded>

export type GraphNodeTupleAsyncFn<Id extends string, Returned> = (...nodes: [GraphNode<Id>, GraphNode<Id>]) => Promise<Returned>

export type GraphNodeTupleAsyncGeneratorFn<Id extends string, Yielded> = (...nodes: [GraphNode<Id>, GraphNode<Id>]) => AsyncGenerator<Yielded>

export type GraphStateAsyncFn<Id extends string, Metadata, Returned> = (state: GraphState<Id, Metadata>) => Promise<Returned>
