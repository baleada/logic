export type Graph<Id extends string, StateValue> = {
  nodes: GraphNode<Id>[],
  edges: GraphEdge<Id, StateValue>[],
}

export type GraphNode<Id extends string> = Id

export type GraphEdge<
  Id extends string,
  StateValue
> = {
  from: Id,
  to: Id,
  predicateShouldTraverse: (state: GraphState<Id, StateValue>) => boolean
}

export type GraphState<
  Id extends string,
  StateValue
> = Record<
  Id,
  {
    status: 'set' | 'unset',
    value?: StateValue | undefined,
  }
>

export type GraphPath<Id extends string> = GraphNode<Id>[]

export type GraphStep<
  Id extends string,
  StateValue
> = {
  state: GraphState<Id, StateValue>
  path: GraphPath<Id>,
}

export type GraphCommonAncestor<Id extends string> = {
  node: GraphNode<Id>,
  distances: Record<GraphNode<Id>, number>
}

export type GraphTreeNode<Id extends string> = {
  node: GraphNode<Id>,
  children: GraphTreeNode<Id>[],
}

export type GraphTree<Id extends string> = GraphTreeNode<Id>[]

export function defineGraph<Id extends string, StateValue> (
  nodes: GraphNode<Id>[],
  edges: GraphEdge<Id, StateValue>[]
) {
  return { nodes, edges }
}

export function defineGraphNodes<Id extends string> (nodes: GraphNode<Id>[]) {
  return nodes
}

export function defineGraphEdges<Id extends string, StateValue> (edges: GraphEdge<Id, StateValue>[]) {
  return edges
}

export function defineGraphNode<Id extends string> (node: GraphNode<Id>) {
  return node
}

export function defineGraphEdge<
  Id extends string,
  StateValue
> (
  from: GraphNode<Id>,
  to: GraphNode<Id>,
  predicateShouldTraverse: (state: GraphState<Id, StateValue>) => boolean
) {
  return { from, to, predicateShouldTraverse }
}

export type GraphAsync<Id extends string, StateValue> = {
  nodes: GraphNode<Id>[],
  edges: GraphAsyncEdge<Id, StateValue>[],
}

export type GraphAsyncEdge<
  Id extends string,
  StateValue
> = {
  from: Id,
  to: Id,
  predicateShouldTraverse: (state: GraphState<Id, StateValue>) => Promise<boolean>
}

export function defineGraphAsync<Id extends string, StateValue> (
  nodes: GraphNode<Id>[],
  edges: GraphAsyncEdge<Id, StateValue>[]
) {
  return { nodes, edges }
}

export function defineGraphAsyncEdges<Id extends string, StateValue> (edges: GraphAsyncEdge<Id, StateValue>[]) {
  return edges
}

export function defineGraphAsyncEdge<
  Id extends string,
  StateValue
> (
  from: GraphNode<Id>,
  to: GraphNode<Id>,
  predicateShouldTraverse: (state: GraphState<Id, StateValue>) => Promise<boolean>
) {
  return { from, to, predicateShouldTraverse }
}
