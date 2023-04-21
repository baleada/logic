import type { Graph, GraphEdge } from '../extracted'
import { createFilter } from './createFilter'
import type { GraphVertexFn } from './types'

export function createToIndegree<
  Id extends string,
  Metadata
> (graph: Graph<Id, Metadata>): GraphVertexFn<Id, number> {
  const toIncoming = createToIncoming(graph)
  return node => toIncoming(node).length
}

export function createToOutdegree<
  Id extends string,
  Metadata
> (graph: Graph<Id, Metadata>): GraphVertexFn<Id, number> {
  const toOutgoing = createToOutgoing(graph)
  return node => toOutgoing(node).length
}

export function createToIncoming<
  Id extends string,
  Metadata
> (graph: Graph<Id, Metadata>): GraphVertexFn<Id, GraphEdge<Id, Metadata>[]> {
  const { edges } = graph
  return node => createFilter<typeof edges[0]>(({ to }) => to === node)(edges)
}

export function createToOutgoing<
  Id extends string,
  Metadata
> (graph: Graph<Id, Metadata>): GraphVertexFn<Id, GraphEdge<Id, Metadata>[]> {
  const { edges } = graph
  return node => createFilter<typeof edges[0]>(({ from }) => from === node)(edges)
}

export function createPredicateRoot<
  Id extends string,
  Metadata
> (graph: Graph<Id, Metadata>): GraphVertexFn<Id, boolean> {
  const toIndegree = createToIndegree(graph)
  return node => toIndegree(node) === 0
}
