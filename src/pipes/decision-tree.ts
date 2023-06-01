import type { DeepRequired, Expand, Graph } from '../extracted'
import {
  createToLayers as createDirectedAcyclicToLayers,
  createToTree as createDirectedAcyclicToTree,
  createToCommonAncestors as createDirectedAcyclicToCommonAncestors,
  createPredicateAncestor as createDirectedAcyclicPredicateAncestor,
  createToNodeSteps as createDirectedAcyclicToNodeSteps,
  createToSteps as createDirectedAcyclicToSteps,
  createToPath as createDirectedAcyclicToPath,
  createToRoots as createDirectedAcyclicToRoots,
} from './directed-acyclic'
import type { CreateToStepsOptions as CreateDirectedAcyclicToStepsOptions } from './directed-acyclic'

export type CreateToStepsOptions<Id extends string> = Expand<
  Pick<CreateDirectedAcyclicToStepsOptions<Id, DecisionTreeMetadata>, 'kind'> & {
    priorityBranch?: boolean,
  }
>

export type DecisionTree<Id extends string> = Graph<Id, DecisionTreeMetadata>

export type DecisionTreeMetadata = boolean

export const defaultCreateToStepsOptions: DeepRequired<CreateToStepsOptions<string>> = {
  priorityBranch: false,
  kind: 'directed acyclic',
}

export function createToLayers<Id extends string> (
  options: { createToSteps?: CreateToStepsOptions<Id> } = {}
) {
  const withDefaults = {
    ...options,
    createToSteps: {
      ...defaultCreateToStepsOptions,
      ...options.createToSteps,
    },
  }

  return createDirectedAcyclicToLayers<Id, DecisionTreeMetadata>({
    ...withDefaults,
    createToSteps: toCreateDirectedAcyclicToStepsOptions<Id>(withDefaults.createToSteps),
  })
}

export function createToTree<Id extends string> (
  options: { createToSteps?: CreateToStepsOptions<Id> } = {}
) {
  const withDefaults = {
    ...options,
    createToSteps: {
      ...defaultCreateToStepsOptions,
      ...options.createToSteps,
    },
  }

  return createDirectedAcyclicToTree<Id, DecisionTreeMetadata>({
    ...withDefaults,
    createToSteps: toCreateDirectedAcyclicToStepsOptions<Id>(withDefaults.createToSteps),
  })
}

export function createToCommonAncestors<Id extends string> (
  ...params: Parameters<typeof createDirectedAcyclicToCommonAncestors<Id, DecisionTreeMetadata>>
) {
  return createDirectedAcyclicToCommonAncestors<Id, DecisionTreeMetadata>(...params)
}

export function createPredicateAncestor<Id extends string> (
  ...params: Parameters<typeof createDirectedAcyclicPredicateAncestor<Id, DecisionTreeMetadata>>
) {
  return createDirectedAcyclicPredicateAncestor<Id, DecisionTreeMetadata>(...params)
}

export function createToNodeSteps<Id extends string> (
  decisionTree: DecisionTree<Id>,
  options: { createToSteps?: CreateToStepsOptions<Id> } = {}
) {
  const withDefaults = {
    ...options,
    createToSteps: {
      ...defaultCreateToStepsOptions,
      ...options.createToSteps,
    },
  }

  return createDirectedAcyclicToNodeSteps<Id, DecisionTreeMetadata>(
    decisionTree,
    {
      ...withDefaults,
      createToSteps: toCreateDirectedAcyclicToStepsOptions<Id>(withDefaults.createToSteps),
    }
  )
}

export function createToSteps<Id extends string> (
  options: CreateToStepsOptions<Id> = {}
) {
  const withDefaults = {
    ...defaultCreateToStepsOptions,
    ...options,
  }
  
  return createDirectedAcyclicToSteps<Id, DecisionTreeMetadata>(
    toCreateDirectedAcyclicToStepsOptions<Id>(withDefaults)
  )
}

export function createToPath<Id extends string> (
  ...params: Parameters<typeof createDirectedAcyclicToPath<Id, DecisionTreeMetadata>>
) {
  return createDirectedAcyclicToPath<Id, DecisionTreeMetadata>(...params)
}

export function createToRoots<Id extends string> (
  ...params: Parameters<typeof createDirectedAcyclicToRoots<Id, DecisionTreeMetadata>>
) {
  return createDirectedAcyclicToRoots<Id, DecisionTreeMetadata>(...params)
}

function toCreateDirectedAcyclicToStepsOptions<Id extends string> (
  options: DeepRequired<CreateToStepsOptions<Id>>
): CreateDirectedAcyclicToStepsOptions<Id, DecisionTreeMetadata> {
  return {
    ...defaultCreateToStepsOptions,
    ...options,
    ...{
      toUnsetMetadata: () => false,
      toMockMetadata: (node, totalConnectionsFollowed) => options.priorityBranch
        ? !totalConnectionsFollowed
        : !!totalConnectionsFollowed,
    },
  }
}
