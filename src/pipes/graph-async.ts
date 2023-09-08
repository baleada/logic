import type {
  GraphState,
  GraphNode,
  GraphAsync,
} from '../extracted'
import type { GeneratorTransform } from './generator'
import type { GeneratorAsyncTransform } from './generator-async'

export type GraphAsyncTransform<Id extends string, Metadata, Transformed> = (graph: GraphAsync<Id, Metadata>) => Promise<Transformed>

export type GraphAsyncGeneratorTransform<Id extends string, Metadata, Yielded> = GeneratorTransform<GraphAsync<Id, Metadata>, Yielded>

export type GraphAsyncGeneratorAsyncTransform<Id extends string, Metadata, Yielded> = GeneratorAsyncTransform<GraphAsync<Id, Metadata>, Yielded>

export type GraphAsyncNodeGeneratorTransform<Id extends string, Yielded> = GeneratorAsyncTransform<GraphNode<Id>, Yielded>

export type GraphAsyncNodeTupleTransform<Id extends string, Transformed> = (...nodes: [GraphNode<Id>, GraphNode<Id>]) => Promise<Transformed>

export type GraphAsyncNodeTupleGeneratorTransform<Id extends string, Yielded> = (...nodes: [GraphNode<Id>, GraphNode<Id>]) => AsyncGenerator<Yielded>

export type GraphAsyncStateTransform<Id extends string, Metadata, Transformed> = (state: GraphState<Id, Metadata>) => Promise<Transformed>
