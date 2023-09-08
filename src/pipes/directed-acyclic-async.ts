import {
  pipe,
  toArray,
  at,
  includes,
} from 'lazy-collections'
import type {
  GraphNode,
  GraphState,
  GraphStep,
  GraphTree,
  GraphAsync,
} from '../extracted'
import type { GraphAsyncTransform, GraphAsyncGeneratorAsyncTransform } from './graph-async'
import { createPath } from './directed-acyclic-async-state'
import type {
  CreateStepsOptions,
  CreateStepsConfig,
  CreateDepthFirstStepsOptions,
  CreateBreadthFirstStepsOptions,
} from './directed-acyclic'
import {
  createRoots,
  defaultCreateStepsOptions,
  createConfigureDepthFirstSteps,
  createConfigureBreadthFirstSteps,
} from './directed-acyclic'
import { createFind as createTreeFind } from './graph-tree'

export function createLayers<
  Id extends string
>(options: { createDepthFirstSteps?: CreateStepsOptions<Id> } = {}): GraphAsyncTransform<Id, any, GraphNode<Id>[][]> {
  const toSteps = createDepthFirstSteps<Id>(options.createDepthFirstSteps)

  return async function toLayers (directedAcyclicAsync) {
    const layers: GraphNode<Id>[][] = []

    for await (const { path } of toSteps(directedAcyclicAsync)) {
      const node = path.at(-1),
            depth = path.length - 1

      ;(layers[depth] || (layers[depth] = [])).push(node)
    }

    return layers
  }
}


// TODO: root option, multiple roots
export function createTree<
  Id extends string
>(options: { createDepthFirstSteps?: CreateStepsOptions<Id> } = {}): GraphAsyncTransform<Id, any, GraphTree<Id>> {
  const toSteps = createDepthFirstSteps<Id>(options.createDepthFirstSteps)

  return async function toTree (directedAcyclicAsync) {
    const firstRoot = pipe(
            createRoots<Id, any, typeof directedAcyclicAsync>(),
            at(0),
          )(directedAcyclicAsync) as GraphNode<Id>,
          tree: GraphTree<Id> = []
          
    tree.push({
      node: firstRoot,
      children: [],
    })

    for await (const { path } of toSteps(directedAcyclicAsync)) {
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

export function createDepthFirstSteps<Id extends string, StateValue = number> (
  options: CreateDepthFirstStepsOptions<Id, StateValue> = {}
): GraphAsyncGeneratorAsyncTransform<Id, StateValue, GraphStep<Id, StateValue>> {
  return createSteps<Id, StateValue>(
    createConfigureDepthFirstSteps<Id, StateValue>(options),
    options
  )
}

export function createBreadthFirstSteps<Id extends string, StateValue = number> (
  options: CreateBreadthFirstStepsOptions<Id, StateValue> = {}
): GraphAsyncGeneratorAsyncTransform<Id, StateValue, GraphStep<Id, StateValue>> {
  return createSteps<Id, StateValue>(
    createConfigureBreadthFirstSteps<Id, StateValue>(options),
    options
  )
}

export function createSteps<
  Id extends string,
  StateValue
> (
  configure: (directedAcyclicAsync: GraphAsync<Id, StateValue>) => CreateStepsConfig<Id, StateValue>,
  options: CreateStepsOptions<Id> = {}
): GraphAsyncGeneratorAsyncTransform<Id, StateValue, GraphStep<Id, StateValue>> {
  return async function* (directedAcyclicAsync) {
    const {
            getSetStateValue,
            stepFromEffect,
            predicateSteppable,
            predicateExhausted,
            createPath: createPathConfig,
          } = configure(directedAcyclicAsync),
          { kind, root } = { ...defaultCreateStepsOptions, ...options },
          { nodes } = directedAcyclicAsync,
          toPath = createPath(directedAcyclicAsync, createPathConfig),
          roots = pipe(
            createRoots<Id, StateValue, typeof directedAcyclicAsync>({ kind }),
            toArray(),
          )(directedAcyclicAsync),
          state = {} as GraphState<Id, StateValue>

    for (const node of nodes) {
      state[node] = {
        status: 'unset',
        value: undefined,
      }
    }

    let location = root || at(0)(roots) as GraphNode<Id>

    const path = await toPath(state)

    yield { path, state: JSON.parse(JSON.stringify(state)) }

    async function* toStep (): AsyncGenerator<GraphStep<Id, StateValue>> {  
      if (predicateExhausted(location)) {
        if (includes(location)(roots)) return
  
        state[location].status = 'unset'
        delete state[location].value
  
        const path = await toPath(state)
        location = path.at(-2)
  
        yield* await toStep()
        return
      }
      
      state[location].status = 'set'
      state[location].value = getSetStateValue(location)
      
      const path = await toPath(state)      
  
      yield { path, state: JSON.parse(JSON.stringify(state)) }
      stepFromEffect(location)
  
      const newLocation = path.at(-1)
  
      if (predicateSteppable(newLocation)) location = newLocation
  
      yield* await toStep()
    }
  
    yield* await toStep()
  }
}
