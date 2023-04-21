import type { Graph, Expand } from '../extracted'
import type { DirectedAcyclicFns, CreateDirectedAcyclicFnsOptions } from './createDirectedAcyclicFns'
import { createDirectedAcyclicFns, defaultOptions as defaultDirectedAcyclicFnsOptions } from './createDirectedAcyclicFns'

export type CreateDecisionTreeOptions<Id extends string> = Expand<
  Pick<CreateDirectedAcyclicFnsOptions<Id, DecisionTreeMetadata>, 'kind'> & {
    walkPriority?: boolean,
  }
>

export type DecisionTreeFns<Id extends string> = DirectedAcyclicFns<Id, DecisionTreeMetadata>

export type DecisionTreeMetadata = boolean

const defaultOptions: CreateDecisionTreeOptions<string> = {
  walkPriority: false,
  kind: defaultDirectedAcyclicFnsOptions.kind,
}

export function createDecisionTreeFns<Id extends string> (
  graph: Graph<Id, DecisionTreeMetadata>,
  options: CreateDecisionTreeOptions<Id> = {}
): DecisionTreeFns<Id> {
  const { walkPriority, kind } = { ...defaultOptions, ...options }

  return createDirectedAcyclicFns<Id, DecisionTreeMetadata>(
    graph,
    {
      toUnsetMetadata: () => false,
      toMockMetadata: (node, totalConnectionsFollowed) => walkPriority
        ? !totalConnectionsFollowed
        : !!totalConnectionsFollowed,
      kind,
    },
  )
}
