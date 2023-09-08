import type { DeepRequired, Graph } from '../extracted'
import {
  createLayers as createDirectedAcyclicLayers,
  createTree as createDirectedAcyclicTree,
  createRoots as createDirectedAcyclicRoots,
  createSteps as createDirectedAcyclicSteps,
  createConfigureDepthFirstSteps as createConfigureDirectedAcyclicDepthFirstSteps,
  createConfigureBreadthFirstSteps as createConfigureDirectedAcyclicBreadthFirstSteps,
} from './directed-acyclic'
import type {
  CreateStepsOptions as CreateDirectedAcyclicStepsOptions,
} from './directed-acyclic'
import {
  createCommonAncestors as createDirectedAcyclicCommonAncestors,
  createAncestor as createDirectedAcyclicPredicateAncestor,
  createNodeDepthFirstSteps as createDirectedAcyclicNodeDepthFirstSteps,
} from './directed-acyclic-node'
import {
  createPath as createDirectedAcyclicPath,
} from './directed-acyclic-state'
import { createTotalSiblings } from './graph-node'

export type CreateStepsOptions<Id extends string> = Pick<CreateDirectedAcyclicStepsOptions<Id>, 'kind'> & {
  priorityBranch?: boolean,
}

export type DecisionTree<Id extends string> = Graph<Id, DecisionTreeStateValue>

export type DecisionTreeStateValue = boolean

const defaultCreateStepsOptions: DeepRequired<CreateStepsOptions<string>> = {
  priorityBranch: false,
  kind: 'directed acyclic',
}

export function createLayers<Id extends string> (
  options: { createDepthFirstSteps?: CreateStepsOptions<Id> } = {}
) {
  const withDefaults = {
    ...options,
    createDepthFirstSteps: {
      ...defaultCreateStepsOptions,
      ...options.createDepthFirstSteps,
    },
  }

  return createDirectedAcyclicLayers<Id>(withDefaults)
}

export function createTree<Id extends string> (
  options: { createDepthFirstSteps?: CreateStepsOptions<Id> } = {}
) {
  const withDefaults = {
    ...options,
    createDepthFirstSteps: {
      ...defaultCreateStepsOptions,
      ...options.createDepthFirstSteps,
    },
  }

  return createDirectedAcyclicTree<Id>(withDefaults)
}

export function createCommonAncestors<Id extends string> (
  ...params: Parameters<typeof createDirectedAcyclicCommonAncestors<Id, DecisionTreeStateValue>>
) {
  return createDirectedAcyclicCommonAncestors<Id, DecisionTreeStateValue>(...params)
}

export function createAncestor<Id extends string> (
  ...params: Parameters<typeof createDirectedAcyclicPredicateAncestor<Id, DecisionTreeStateValue>>
) {
  return createDirectedAcyclicPredicateAncestor<Id, DecisionTreeStateValue>(...params)
}

export function createNodeDepthFirstSteps<Id extends string> (
  decisionTree: DecisionTree<Id>,
  options: { createDepthFirstSteps?: CreateStepsOptions<Id> } = {}
) {
  const withDefaults = {
    ...options,
    createDepthFirstSteps: {
      ...defaultCreateStepsOptions,
      ...options.createDepthFirstSteps,
    },
  }

  return createDirectedAcyclicNodeDepthFirstSteps<Id, DecisionTreeStateValue>(
    decisionTree,
    withDefaults,
  )
}

export function createDepthFirstSteps<Id extends string> (
  options: CreateStepsOptions<Id>
) {
  const { priorityBranch } = { ...defaultCreateStepsOptions, ...options },
        configureDepthFirstSteps = createConfigureDirectedAcyclicDepthFirstSteps<Id, boolean>({
          getSetStateValue: ({ totalChildrenDiscovered }) => totalChildrenDiscovered === 0
            ? priorityBranch
            : !priorityBranch,
        })

  return createDirectedAcyclicSteps(configureDepthFirstSteps, options)
}

export function createBreadthFirstSteps<Id extends string> (
  options: CreateStepsOptions<Id>
) {
  const { priorityBranch } = options,
        configureBreadthFirstSteps: ReturnType<
          typeof createConfigureDirectedAcyclicBreadthFirstSteps<Id, boolean>
        > = decisionTree => {
          const toTotalSiblings = createTotalSiblings(decisionTree),
                configure = createConfigureDirectedAcyclicBreadthFirstSteps<Id, boolean>({
                  getSetStateValue: ({ node, totalSiblingsDiscovered }) => totalSiblingsDiscovered === toTotalSiblings(node)
                    ? priorityBranch
                    : !priorityBranch,
                })

          return configure(decisionTree)
        }

  return createDirectedAcyclicSteps(configureBreadthFirstSteps, options)
}

export function createPath<Id extends string> (
  ...params: Parameters<typeof createDirectedAcyclicPath<Id, DecisionTreeStateValue>>
) {
  return createDirectedAcyclicPath<Id, DecisionTreeStateValue>(...params)
}

export function createRoots<Id extends string> (
  ...params: Parameters<typeof createDirectedAcyclicRoots<Id, DecisionTreeStateValue>>
) {
  return createDirectedAcyclicRoots<Id, DecisionTreeStateValue>(...params)
}

