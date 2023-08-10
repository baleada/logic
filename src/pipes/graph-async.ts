import type {
  GraphState,
  GraphNode,
  AsyncGraph,
} from '../extracted'
import type { GeneratorTransform } from './generator'
import type { AsyncGeneratorTransform } from './generator-async'

export type AsyncGraphTransform<Id extends string, Metadata, Transformed> = (graph: AsyncGraph<Id, Metadata>) => Promise<Transformed>

export type AsyncGraphGeneratorTransform<Id extends string, Metadata, Yielded> = GeneratorTransform<AsyncGraph<Id, Metadata>, Yielded>

export type AsyncGraphAsyncGeneratorTransform<Id extends string, Metadata, Yielded> = AsyncGeneratorTransform<AsyncGraph<Id, Metadata>, Yielded>

export type GraphNodeAsyncGeneratorTransform<Id extends string, Yielded> = AsyncGeneratorTransform<GraphNode<Id>, Yielded>

export type GraphNodeTupleAsyncTransform<Id extends string, Transformed> = (...nodes: [GraphNode<Id>, GraphNode<Id>]) => Promise<Transformed>

export type GraphNodeTupleAsyncGeneratorTransform<Id extends string, Yielded> = (...nodes: [GraphNode<Id>, GraphNode<Id>]) => AsyncGenerator<Yielded>

export type GraphStateAsyncTransform<Id extends string, Metadata, Transformed> = (state: GraphState<Id, Metadata>) => Promise<Transformed>
