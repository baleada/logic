import { pipe, filter } from 'lazy-collections'
import { length } from '../extracted'
import type { Graph, AsyncGraph, GraphEdge, AsyncGraphEdge } from '../extracted'
import type { GraphNodeFn, GraphNodeGeneratorFn } from './types'

export function createToIndegree<
  Id extends string,
  Metadata,
  GraphType extends Graph<Id, Metadata> | AsyncGraph<Id, Metadata>
> (graph: GraphType): GraphNodeFn<Id, number> {
  const toIncoming = createToIncoming(graph)
  return node => pipe(
    toIncoming,
    length(),
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
    length(),
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
    yield * filter<typeof edges[0]>(
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
    yield * filter<typeof edges[0]>(
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
