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
import type { GeneratorFn } from './generator'

export type GraphFn<Id extends string, Metadata, Returned> = (graph: Graph<Id, Metadata>) => Returned

export type GraphGeneratorFn<Id extends string, Metadata, Yielded> = GeneratorFn<Graph<Id, Metadata>, Yielded>

export type GraphNodeFn<Id extends string, Returned> = (node: GraphNode<Id>) => Returned

export type GraphNodeGeneratorFn<Id extends string, Yielded> = GeneratorFn<GraphNode<Id>, Yielded>

export type GraphNodeTupleFn<Id extends string, Returned> = (...nodes: [GraphNode<Id>, GraphNode<Id>]) => Returned

export type GraphNodeTupleGeneratorFn<Id extends string, Yielded> = (...nodes: [GraphNode<Id>, GraphNode<Id>]) => Generator<Yielded>

export type GraphStateFn<Id extends string, Metadata, Returned> = (state: GraphState<Id, Metadata>) => Returned

export function createToIndegree<
  Id extends string,
  Metadata,
  GraphType extends Graph<Id, Metadata> | AsyncGraph<Id, Metadata>
> (graph: GraphType): GraphNodeFn<Id, number> {
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
> (graph: GraphType): GraphNodeFn<Id, number> {
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
> (graph: GraphType): GraphNodeGeneratorFn<
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
> (graph: GraphType): GraphNodeGeneratorFn<
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
> (graph: GraphType): GraphNodeFn<Id, boolean> {
  const toIndegree = createToIndegree(graph)
  return node => toIndegree(node) === 0
}
