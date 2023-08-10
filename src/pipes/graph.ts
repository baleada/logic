import { pipe, filter } from 'lazy-collections'
import { toLength } from '../extracted'
import type {
  Graph,
  AsyncGraph,
  GraphNode,
  GraphEdge,
  GraphState,
  AsyncGraphEdge,
} from '../extracted'
import type { GeneratorTransform } from './generator'

export type GraphTransform<Id extends string, Metadata, Transformed> = (graph: Graph<Id, Metadata>) => Transformed

export type GraphGeneratorTransform<Id extends string, Metadata, Yielded> = GeneratorTransform<Graph<Id, Metadata>, Yielded>

export type GraphNodeTransform<Id extends string, Transformed> = (node: GraphNode<Id>) => Transformed

export type GraphNodeGeneratorTransform<Id extends string, Yielded> = GeneratorTransform<GraphNode<Id>, Yielded>

export type GraphNodeTupleTransform<Id extends string, Transformed> = (...nodes: [GraphNode<Id>, GraphNode<Id>]) => Transformed

export type GraphNodeTupleGeneratorTransform<Id extends string, Yielded> = (...nodes: [GraphNode<Id>, GraphNode<Id>]) => Generator<Yielded>

export type GraphStateTransform<Id extends string, Metadata, Transformed> = (state: GraphState<Id, Metadata>) => Transformed

export function createToIndegree<
  Id extends string,
  Metadata,
  GraphType extends Graph<Id, Metadata> | AsyncGraph<Id, Metadata>
> (graph: GraphType): GraphNodeTransform<Id, number> {
  const toIncoming = createToIncoming(graph)
  return node => pipe(
    toIncoming,
    toLength(),
  )(node)
}

export function createToOutdegree<
  Id extends string,
  Metadata,
  GraphType extends Graph<Id, Metadata> | AsyncGraph<Id, Metadata>
> (graph: GraphType): GraphNodeTransform<Id, number> {
  const toOutgoing = createToOutgoing(graph)
  return node => pipe(
    toOutgoing,
    toLength(),
  )(node)
}

export function createToIncoming<
  Id extends string,
  Metadata,
  GraphType extends Graph<Id, Metadata> | AsyncGraph<Id, Metadata>
> (graph: GraphType): GraphNodeGeneratorTransform<
  Id,
  GraphType extends AsyncGraph<Id, Metadata>
    ? AsyncGraphEdge<Id, Metadata>
    : GraphEdge<Id, Metadata>
> {
  const { edges } = graph

  type GraphEdgeType = GraphType extends AsyncGraph<Id, Metadata>
    ? AsyncGraphEdge<Id, Metadata>
    : GraphEdge<Id, Metadata>
  
  return function* (node) {
    yield * filter<typeof edges[number]>(
      ({ to }) => to === node
    )(edges) as Iterable<GraphEdgeType>
  }
}

export function createToOutgoing<
  Id extends string,
  Metadata,
  GraphType extends Graph<Id, Metadata> | AsyncGraph<Id, Metadata>
> (graph: GraphType): GraphNodeGeneratorTransform<
  Id,
  GraphType extends AsyncGraph<Id, Metadata>
    ? AsyncGraphEdge<Id, Metadata>
    : GraphEdge<Id, Metadata>
> {
  const { edges } = graph

  type GraphEdgeType = GraphType extends AsyncGraph<Id, Metadata>
    ? AsyncGraphEdge<Id, Metadata>
    : GraphEdge<Id, Metadata>
  
  return function* (node) {
    yield * filter<typeof edges[number]>(
      ({ from }) => from === node
    )(edges) as Iterable<GraphEdgeType>
  }
}

export function createPredicateRoot<
  Id extends string,
  Metadata,
  GraphType extends Graph<Id, Metadata> | AsyncGraph<Id, Metadata>
> (graph: GraphType): GraphNodeTransform<Id, boolean> {
  const toIndegree = createToIndegree(graph)
  return node => toIndegree(node) === 0
}
