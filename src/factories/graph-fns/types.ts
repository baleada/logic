export type GraphNode<Id extends string = string> = Id

export type GraphEdge<
  Id extends string = string,
  Metadata = any
> = {
  from: Id,
  to: Id,
  predicateTraversable: (metadata: GraphState<Id, Metadata>) => boolean
}

export type GraphState<
  Id extends string = string,
  Metadata = any
> = Record<
  Id,
  {
    status: 'set' | 'unset',
    metadata: Metadata,
  }
>

export type GraphTraversal<
  Id extends string = string,
  Metadata = any
> = {
  path: GraphNode<Id>[],
  state: GraphState<Id, Metadata>
}

export type GraphSharedAncestor<Id extends string = string> = {
  node: GraphNode<Id>,
  distances: Record<GraphNode<Id>, number>
}

export function defineGraphNodes<Id extends string = string> (nodes: GraphNode<Id>[]) {
  return nodes
}

export function defineGraphEdges<Id extends string = string> (edges: GraphEdge<Id>[]) {
  return edges
}
