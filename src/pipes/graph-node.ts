import { pipe, filter, map } from 'lazy-collections'
import { toLength } from '../extracted'
import type {
  Graph,
  GraphAsync,
  GraphNode,
  GraphEdge,
  GraphAsyncEdge,
} from '../extracted'
import type { GeneratorTransform } from './generator'

export type GraphNodeTransform<Id extends string, Transformed> = (node: GraphNode<Id>) => Transformed

export type GraphNodeGeneratorTransform<Id extends string, Yielded> = GeneratorTransform<GraphNode<Id>, Yielded>

export type GraphNodeTupleTransform<Id extends string, Transformed> = (...nodes: [GraphNode<Id>, GraphNode<Id>]) => Transformed

export type GraphNodeTupleGeneratorTransform<Id extends string, Yielded> = (...nodes: [GraphNode<Id>, GraphNode<Id>]) => Generator<Yielded>

export function createRoot<
  Id extends string,
  Metadata,
  GraphType extends Graph<Id, Metadata> | GraphAsync<Id, Metadata>
> (graph: GraphType): GraphNodeTransform<Id, boolean> {
  const toIndegree = createIndegree(graph)
  return node => toIndegree(node) === 0
}

export function createTerminal<
  Id extends string,
  Metadata,
  GraphType extends Graph<Id, Metadata> | GraphAsync<Id, Metadata>
> (graph: GraphType): GraphNodeTransform<Id, boolean> {
  const toOutdegree = createOutdegree(graph)
  return node => toOutdegree(node) === 0
}

export function createChildren<
  Id extends string,
  Metadata,
  GraphType extends Graph<Id, Metadata> | GraphAsync<Id, Metadata>
> (graph: GraphType): GraphNodeGeneratorTransform<GraphNode<Id>, GraphNode<Id>> {
  return function* (node) {
    const outgoing = createOutgoing<Id, Metadata, GraphType>(graph)(node)
    for (const edge of outgoing) yield edge.to
  }
}

export function createIndegree<
  Id extends string,
  Metadata,
  GraphType extends Graph<Id, Metadata> | GraphAsync<Id, Metadata>
> (graph: GraphType): GraphNodeTransform<Id, number> {
  const toIncoming = createIncoming(graph)
  return node => pipe(
    toIncoming,
    toLength(),
  )(node)
}

export function createOutdegree<
  Id extends string,
  Metadata,
  GraphType extends Graph<Id, Metadata> | GraphAsync<Id, Metadata>
> (graph: GraphType): GraphNodeTransform<Id, number> {
  const toOutgoing = createOutgoing(graph)
  return node => pipe(
    toOutgoing,
    toLength(),
  )(node)
}

export function createIncoming<
  Id extends string,
  Metadata,
  GraphType extends Graph<Id, Metadata> | GraphAsync<Id, Metadata>
> (graph: GraphType): GraphNodeGeneratorTransform<
  GraphNode<Id>,
  GraphType extends GraphAsync<Id, Metadata>
    ? GraphAsyncEdge<Id, Metadata>
    : GraphEdge<Id, Metadata>
> {
  const { edges } = graph

  type GraphEdgeType = GraphType extends GraphAsync<Id, Metadata>
    ? GraphAsyncEdge<Id, Metadata>
    : GraphEdge<Id, Metadata>
  
  return function* (node) {
    yield * filter<typeof edges[number]>(
      ({ to }) => to === node
    )(edges) as Iterable<GraphEdgeType>
  }
}

export function createOutgoing<
  Id extends string,
  Metadata,
  GraphType extends Graph<Id, Metadata> | GraphAsync<Id, Metadata>
> (graph: GraphType): GraphNodeGeneratorTransform<
  GraphNode<Id>,
  GraphType extends GraphAsync<Id, Metadata>
    ? GraphAsyncEdge<Id, Metadata>
    : GraphEdge<Id, Metadata>
> {
  const { edges } = graph

  type GraphEdgeType = GraphType extends GraphAsync<Id, Metadata>
    ? GraphAsyncEdge<Id, Metadata>
    : GraphEdge<Id, Metadata>
  
  return function* (node) {
    yield * filter<typeof edges[number]>(
      ({ from }) => from === node
    )(edges) as Iterable<GraphEdgeType>
  }
}

// TODO: this is the wrong predicate. I don't care if something is an only child,
// I care if it's the last node in a given layer.
export function createOnlyChild<
  Id extends string,
  Metadata,
  GraphType extends Graph<Id, Metadata> | GraphAsync<Id, Metadata>
> (graph: GraphType): GraphNodeTransform<Id, boolean> {
  const toTotalSiblings = createTotalSiblings(graph)
  return node => toTotalSiblings(node) === 0
}

export function createTotalSiblings<
  Id extends string,
  Metadata,
  GraphType extends Graph<Id, Metadata> | GraphAsync<Id, Metadata>
> (graph: GraphType): GraphNodeTransform<Id, number> {
  const toSiblings = createSiblings(graph)
  return node => pipe(
    toSiblings,
    toLength(),
  )(node)
}

export function createSiblings<
  Id extends string,
  Metadata,
  GraphType extends Graph<Id, Metadata> | GraphAsync<Id, Metadata>
> (graph: GraphType): GraphNodeGeneratorTransform<GraphNode<Id>, GraphNode<Id>> {
  const { edges } = graph

  return function* (node) {
    const parents = pipe(
      filter<typeof edges[number]>(
        ({ to }) => to === node
      ),
      map<typeof edges[number], typeof edges[number]['from']>(
        ({ from }) => from
      )
    )(edges) as Iterable<GraphNode<Id>>
    

    for (const parent of parents) {
      yield * pipe(
        filter<typeof edges[number]>(
          ({ from, to }) => from === parent && to !== node
        ),
        map<typeof edges[number], typeof edges[number]['to']>(
          ({ to }) => to
        )
      )(edges) as Iterable<GraphNode<Id>>
    }
  }
}
