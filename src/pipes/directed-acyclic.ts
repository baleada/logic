import {
  pipe,
  toArray,
  at,
  includes,
} from 'lazy-collections'
import type {
  Graph,
  GraphNode,
  GraphState,
  GraphStep,
  GraphTree,
  GraphAsync,
} from '../extracted'
import { createDepthPathConfig, createBreadthPathConfig } from '../factories'
import {
  createOnlyChild,
  createOutdegree,
  createTerminal,
} from './graph-node'
import type {
  GraphGeneratorTransform,
  GraphTransform,
} from './graph'
import type { GraphAsyncGeneratorTransform } from './graph-async'
import { createRoot } from './graph-node'
import { createFind as createTreeFind } from './graph-tree'
import { createPath } from './directed-acyclic-state'
import type { CreatePathConfig } from './directed-acyclic-state'
import { createReduce } from './array'

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/directed-acyclic-layers)
 */
export function createLayers<
  Id extends string
>(options: { createDepthFirstSteps?: CreateStepsOptions<Id> } = {}): GraphGeneratorTransform<Id, any, GraphNode<Id>[]> {
  const toSteps = createDepthFirstSteps<Id>(options.createDepthFirstSteps)

  return function* toLayers (directedAcyclic) {
    const layers: GraphNode<Id>[][] = []

    for (const { path } of toSteps(directedAcyclic)) {
      const node = path.at(-1),
            depth = path.length - 1

      // After we complete a layer, yield it
      if (!layers[depth] && depth > 0) yield layers[depth - 1]

      ;(layers[depth] || (layers[depth] = [])).push(node)
    }

    // Yield the last layer
    yield layers.at(-1)
  }
}

// TODO: root option, multiple roots
/**
 * [Docs](https://baleada.dev/docs/logic/pipes/directed-acyclic-tree)
 */
export function createTree<
  Id extends string
>(options: { createDepthFirstSteps?: CreateStepsOptions<Id> } = {}): GraphTransform<Id, any, GraphTree<Id>> {
  const toSteps = createDepthFirstSteps<Id>(options.createDepthFirstSteps)

  return directedAcyclic => {
    const firstRoot = pipe(
            createRoots<Id, any, typeof directedAcyclic>(),
            at(0),
          )(directedAcyclic) as GraphNode<Id>,
          tree: GraphTree<Id> = []

    tree.push({
      node: firstRoot,
      children: [],
    })

    for (const { path } of toSteps(directedAcyclic)) {
      const node = path.at(-1),
            parent = path.at(-2)

      if (parent) {
        const parentTreeNode = createTreeFind(parent)(tree)
        if (parentTreeNode) {
          parentTreeNode.children.push({
            node,
            children: [],
          })
        }
      }
    }

    return tree
  }
}

export type CreateDepthFirstStepsOptions<Id extends string, StateValue = number> = CreateStepsOptions<Id> & {
  getSetStateValue?: (api: { node: GraphNode<Id>, totalChildrenDiscovered: number }) => StateValue,
}

const defaultCreateDepthFirstStepsOptions: CreateDepthFirstStepsOptions<any> = {
  getSetStateValue: ({ totalChildrenDiscovered }) => totalChildrenDiscovered,
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/directed-acyclic-depth-first-steps)
 */
export function createDepthFirstSteps<Id extends string, StateValue = number> (
  options: CreateDepthFirstStepsOptions<Id, StateValue> = {}
): GraphGeneratorTransform<Id, StateValue, GraphStep<Id, StateValue>> {
  return createSteps<Id, StateValue>(
    createConfigureDepthFirstSteps<Id, StateValue>(options),
    options
  )
}

export function createConfigureDepthFirstSteps<Id extends string, StateValue = number> (
  options: CreateDepthFirstStepsOptions<Id, StateValue>
) {
  const { getSetStateValue: getSetStateValueOption } = {
    ...defaultCreateDepthFirstStepsOptions,
    ...options,
  } as CreateDepthFirstStepsOptions<Id, StateValue>

  return function (
    directedAcyclic: Graph<Id, StateValue> | GraphAsync<Id, StateValue>
  ): CreateStepsConfig<Id, StateValue> {
    const getSetStateValue: CreateStepsConfig<Id, StateValue>['getSetStateValue'] = node => getSetStateValueOption({
            node,
            totalChildrenDiscovered: totalChildrenDiscoveredByNode[node],
          }),
          stepFromEffect = node => totalChildrenDiscoveredByNode[node]++,
          predicateSteppable = node => !predicateTerminal(node),
          predicateTerminal = createTerminal(directedAcyclic),
          predicateExhausted: CreateStepsConfig<Id, StateValue>['predicateExhausted'] = node =>
            totalChildrenDiscoveredByNode[node] === toTotalSiblings(node),
          toTotalSiblings = createOutdegree(directedAcyclic),
          totalChildrenDiscoveredByNode = createReduce<Id, Record<Id, number>>(
            (totalChildrenDiscoveredByNode, node) => {
              totalChildrenDiscoveredByNode[node] = 0
              return totalChildrenDiscoveredByNode
            },
            {} as Record<Id, number>,
          )(directedAcyclic.nodes)

    return {
      getSetStateValue,
      stepFromEffect,
      predicateSteppable,
      predicateExhausted,
      createPath: createDepthPathConfig(directedAcyclic),
    }
  }
}

export type CreateBreadthFirstStepsOptions<Id extends string, StateValue = number> = CreateStepsOptions<Id> & {
  getSetStateValue?: (api: { node: GraphNode<Id>, totalSiblingsDiscovered: number }) => StateValue,
}

export const defaultCreateBreadthFirstStepsOptions: CreateBreadthFirstStepsOptions<any> = {
  getSetStateValue: ({ totalSiblingsDiscovered }) => totalSiblingsDiscovered,
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/directed-acyclic-breadth-first-steps)
 */
export function createBreadthFirstSteps<Id extends string, StateValue = number> (
  options: CreateBreadthFirstStepsOptions<Id, StateValue> = {}
): GraphGeneratorTransform<Id, StateValue, GraphStep<Id, StateValue>> {
  return createSteps<Id, StateValue>(
    createConfigureBreadthFirstSteps<Id, StateValue>(options),
    options
  )
}

export function createConfigureBreadthFirstSteps<Id extends string, StateValue = number> (
  options: CreateBreadthFirstStepsOptions<Id, StateValue>
) {
  const { getSetStateValue: getSetStateValueOption } = {
    ...defaultCreateBreadthFirstStepsOptions,
    ...options,
  } as CreateBreadthFirstStepsOptions<Id, StateValue>

  return function (
    directedAcyclic: Graph<Id, StateValue> | GraphAsync<Id, StateValue>
  ): CreateStepsConfig<Id, StateValue> {
    const getSetStateValue = node => getSetStateValueOption({
            node,
            totalSiblingsDiscovered: totalSiblingsDiscoveredByNode[node],
          }),
          stepFromEffect = node => totalSiblingsDiscoveredByNode[node]++,
          predicateSteppable = node => !predicateOnlyChild(node),
          predicateOnlyChild = createOnlyChild(directedAcyclic),
          predicateExhausted: CreateStepsConfig<Id, StateValue>['predicateExhausted'] = node =>
            totalSiblingsDiscoveredByNode[node] === toTotalSiblings(node),
          toTotalSiblings = createOutdegree(directedAcyclic),
          totalSiblingsDiscoveredByNode = createReduce<Id, Record<Id, number>>(
            (totalSiblingsDiscoveredByNode, node) => {
              totalSiblingsDiscoveredByNode[node] = 0
              return totalSiblingsDiscoveredByNode
            },
            {} as Record<Id, number>,
          )(directedAcyclic.nodes)

    return {
      getSetStateValue,
      stepFromEffect,
      predicateSteppable,
      predicateExhausted,
      createPath: createBreadthPathConfig(directedAcyclic),
    }
  }
}

export type CreateStepsConfig<
  Id extends string,
  StateValue
> = {
  getSetStateValue: (node: GraphNode<Id>) => StateValue,
  stepFromEffect: (node: GraphNode<Id>) => void,
  predicateSteppable: (node: GraphNode<Id>) => boolean,
  predicateExhausted: (node: GraphNode<Id>) => boolean,
  createPath: CreatePathConfig<Id, StateValue>,
}

export type CreateStepsOptions<Id extends string> = {
  kind?: 'directed acyclic' | 'arborescence'
  root?: GraphNode<Id>,
}

export const defaultCreateStepsOptions: CreateStepsOptions<any> = {
  kind: 'directed acyclic',
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/directed-acyclic-steps)
 */
export function createSteps<
  Id extends string,
  StateValue
> (
  configure: (directedAcyclic: Graph<Id, StateValue>) => CreateStepsConfig<Id, StateValue>,
  options: CreateStepsOptions<Id> = {}
): GraphGeneratorTransform<Id, StateValue, GraphStep<Id, StateValue>> {
  return function* (directedAcyclic) {
    const {
            getSetStateValue,
            stepFromEffect,
            predicateSteppable,
            predicateExhausted,
            createPath: createPathConfig,
          } = configure(directedAcyclic),
          { kind, root } = { ...defaultCreateStepsOptions, ...options },
          { nodes } = directedAcyclic,
          toPath = createPath(directedAcyclic, createPathConfig),
          roots = pipe(
            createRoots<Id, StateValue, typeof directedAcyclic>({ kind }),
            toArray(),
          )(directedAcyclic),
          state = {} as GraphState<Id, StateValue>

    for (const node of nodes) {
      state[node] = {
        status: 'unset',
        value: undefined,
      }
    }

    let location = root || at(0)(roots) as GraphNode<Id>

    const path = toPath(state)

    yield { path, state: JSON.parse(JSON.stringify(state)) }

    function* toStep (): Generator<GraphStep<Id, StateValue>> {
      if (predicateExhausted(location)) {
        if (includes(location)(roots)) return

        state[location].status = 'unset'
        delete state[location].value

        const path = toPath(state)
        location = path.at(-2)

        yield* toStep()
        return
      }

      state[location].status = 'set'
      state[location].value = getSetStateValue(location)

      const path = toPath(state)

      yield { path, state: JSON.parse(JSON.stringify(state)) }
      stepFromEffect(location)

      const newLocation = path.at(-1)

      if (predicateSteppable(newLocation)) location = newLocation

      yield* toStep()
    }

    yield* toStep()
  }
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/directed-acyclic-roots)
 */
export function createRoots<
  Id extends string,
  StateValue,
  GraphType extends Graph<Id, StateValue> | GraphAsync<Id, StateValue> = Graph<Id, StateValue>
> (options: { kind?: 'directed acyclic' | 'arborescence' } = {}): (
  GraphType extends GraphAsync<Id, StateValue>
    ? GraphAsyncGeneratorTransform<Id, StateValue, GraphNode<Id>>
    : GraphGeneratorTransform<Id, StateValue, GraphNode<Id>>
 ) {
  return function* (directedAcyclic) {
    const { nodes } = directedAcyclic,
          predicateRoot = createRoot(directedAcyclic)

    for (const node of nodes) {
      if (predicateRoot(node)) yield node
      if (options.kind === 'arborescence') break
    }
  }
}
