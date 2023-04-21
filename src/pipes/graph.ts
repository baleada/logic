import { pipe, filter } from 'lazy-collections'
import { length } from '../extracted'
import type { Graph, GraphEdge } from '../extracted'
import type { GraphNodeFn, GraphNodeGeneratorFn } from './types'

export function createToIndegree<
  Id extends string,
  Metadata
> (graph: Graph<Id, Metadata>): GraphNodeFn<Id, number> {
  const toIncoming = createToIncoming(graph)
  return node => pipe(
    toIncoming,
    length(),
  )(node)
}

export function createToOutdegree<
  Id extends string,
  Metadata
> (graph: Graph<Id, Metadata>): GraphNodeFn<Id, number> {
  const toOutgoing = createToOutgoing(graph)
  return node => pipe(
    toOutgoing,
    length(),
  )(node)
}

export function createToIncoming<
  Id extends string,
  Metadata
> (graph: Graph<Id, Metadata>): GraphNodeGeneratorFn<Id, GraphEdge<Id, Metadata>> {
  const { edges } = graph
  
  return function* (node) {
    yield * filter<typeof edges[0]>(
      ({ to }) => to === node
    )(edges) as Iterable<GraphEdge<Id, Metadata>>
  }
}

export function createToOutgoing<
  Id extends string,
  Metadata
> (graph: Graph<Id, Metadata>): GraphNodeGeneratorFn<Id, GraphEdge<Id, Metadata>> {
  const { edges } = graph
  
  return function* (node) {
    yield * filter<typeof edges[0]>(
      ({ from }) => from === node
    )(edges) as Iterable<GraphEdge<Id, Metadata>>
  }
}

export function createPredicateRoot<
  Id extends string,
  Metadata
> (graph: Graph<Id, Metadata>): GraphNodeFn<Id, boolean> {
  const toIndegree = createToIndegree(graph)
  return node => toIndegree(node) === 0
}
