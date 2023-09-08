import type { GraphNode } from '../extracted'
import type { GeneratorAsyncTransform } from './generator-async'

export type GraphAsyncNodeGeneratorAsyncTransform<Id extends string, Yielded> = GeneratorAsyncTransform<GraphNode<Id>, Yielded>

export type GraphAsyncNodeTupleTransform<Id extends string, Transformed> = (...nodes: [GraphNode<Id>, GraphNode<Id>]) => Promise<Transformed>

export type GraphNodeTupleGeneratorAsyncTransform<Id extends string, Yielded> = (...nodes: [GraphNode<Id>, GraphNode<Id>]) => AsyncGenerator<Yielded>


