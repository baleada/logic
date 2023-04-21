import type { GraphNode, GraphEdge } from './types'
import type { DirectedAcyclicFns } from './createDirectedAcyclicFns'
import { createDirectedAcyclicFns } from './createDirectedAcyclicFns'

export type DecisionTreeFns<Id extends string> = DirectedAcyclicFns<Id, DecisionTreeMetadata>

export type DecisionTreeMetadata = boolean

export function createDecisionTreeFns<Id extends string> (
  nodes: GraphNode<Id>[],
  edges: GraphEdge<Id, DecisionTreeMetadata>[],
  options: { walkPriority?: boolean } = {}
): DecisionTreeFns<Id> {
  const { walkPriority = false } = options

  return createDirectedAcyclicFns<Id, DecisionTreeMetadata>(
    nodes,
    edges,
    () => false,
    (node, totalConnectionsFollowed) => walkPriority
      ? !totalConnectionsFollowed
      : !!totalConnectionsFollowed
  )
}
