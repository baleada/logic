import { GraphNode, GraphEdge } from './types'
import { createDirectedAcyclic, DirectedAcyclic } from "./createDirectedAcyclic"

export type DecisionTree<Id extends string = string> = DirectedAcyclic<Id, DecisionTreeMetadata>

export type DecisionTreeMetadata = boolean

export function createDecisionTree<Id extends string = string> (
  nodes: GraphNode<Id>[],
  edges: GraphEdge<Id, DecisionTreeMetadata>[],
  options: { walkPriority?: boolean } = {}
): DecisionTree<Id> {
  const { walkPriority = false } = options

  return createDirectedAcyclic<Id, DecisionTreeMetadata>(
    nodes,
    edges,
    () => false,
    (node, totalConnectionsFollowed) => walkPriority
      ? !totalConnectionsFollowed
      : !!totalConnectionsFollowed
  )
}
