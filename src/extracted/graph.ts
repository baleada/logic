export type Graph<Id extends string, Metadata> = {
  nodes: GraphNode<Id>[],
  edges: GraphEdge<Id, Metadata>[],
}

export type GraphNode<Id extends string> = Id

export type GraphEdge<
  Id extends string,
  Metadata
> = {
  from: Id,
  to: Id,
  predicateTraversable: (state: GraphState<Id, Metadata>) => boolean
}

export type GraphState<
  Id extends string,
  Metadata
> = Record<
  Id,
  {
    status: 'set' | 'unset',
    metadata: Metadata,
  }
>

export type GraphTraversal<
  Id extends string,
  Metadata
> = {
  path: GraphNode<Id>[],
  state: GraphState<Id, Metadata>
}

export type GraphCommonAncestor<Id extends string> = {
  node: GraphNode<Id>,
  distances: Record<GraphNode<Id>, number>
}

export type GraphTreeNode<Id extends string> = {
  node: GraphNode<Id>,
  children: GraphTreeNode<Id>[],
}

export function defineGraph<Id extends string, Metadata> (
  nodes: GraphNode<Id>[],
  edges: GraphEdge<Id, Metadata>[]
) {
  return { nodes, edges }
}

export function defineGraphNodes<Id extends string> (nodes: GraphNode<Id>[]) {
  return nodes
}

export function defineGraphEdges<Id extends string, Metadata> (edges: GraphEdge<Id, Metadata>[]) {
  return edges
}

export type GraphAsync<Id extends string, Metadata> = {
  nodes: GraphNode<Id>[],
  edges: GraphEdgeAsync<Id, Metadata>[],
}

export type GraphEdgeAsync<
  Id extends string,
  Metadata
> = {
  from: Id,
  to: Id,
  predicateTraversable: (metadata: GraphState<Id, Metadata>) => Promise<boolean>
}

export function defineGraphAsync<Id extends string, Metadata> (
  nodes: GraphNode<Id>[],
  edges: GraphEdgeAsync<Id, Metadata>[]
) {
  return { nodes, edges }
}

export function defineGraphEdgesAsync<Id extends string, Metadata> (edges: GraphEdgeAsync<Id, Metadata>[]) {
  return edges
}
