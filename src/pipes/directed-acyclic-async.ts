import {
  filter,
  pipe,
  some,
  toArray,
  at,
  includes,
} from 'lazy-collections'
import type {
  AsyncGraph,
  GraphNode,
  AsyncGraphEdge,
  GraphState,
  GraphStep,
  GraphCommonAncestor,
  GraphTreeNode,
} from '../extracted'
import { createFindAsync } from './array-async'
import {
  createToOutdegree,
  createToOutgoing,
} from './graph'
import type {
  GraphStateAsyncFn,
  GraphNodeTupleAsyncGeneratorFn,
  AsyncGraphFn,
  AsyncGraphAsyncGeneratorFn,
  GraphNodeAsyncGeneratorFn,
  GraphNodeTupleAsyncFn,
} from './graph-async'
import type { CreateToStepsOptions as CreateDirectedAcyclicToStepsOptions } from './directed-acyclic'
import { createToRoots, defaultCreateToStepsOptions } from './directed-acyclic'
import { createFind as createTreeFind } from './tree'

export function createToLayers<
  Id extends string,
  Metadata
>(options: { createToSteps?: CreateDirectedAcyclicToStepsOptions<Id, Metadata> } = {}): AsyncGraphFn<Id, Metadata, GraphNode<Id>[][]> {
  const toSteps = createToSteps<Id, Metadata>(options.createToSteps)

  return async function toLayers (directedAcyclic) {
    const layers: GraphNode<Id>[][] = []

    for await (const { path } of toSteps(directedAcyclic)) {
      const node = path.at(-1),
            depth = path.length - 1

      ;(layers[depth] || (layers[depth] = [])).push(node)
    }

    return layers
  }
}


// TODO: root option, multiple roots
export function createToTree<
  Id extends string,
  Metadata
>(options: { createToSteps?: CreateToStepsOptions<Id, Metadata> } = {}): AsyncGraphFn<Id, Metadata, GraphTreeNode<Id>[]> {
  const toSteps = createToSteps<Id, Metadata>(options.createToSteps)

  return async function toTree (directedAcyclic) {
    const firstRoot = pipe(
            createToRoots<Id, Metadata, typeof directedAcyclic>(),
            at(0),
          )(directedAcyclic) as GraphNode<Id>,
          tree: GraphTreeNode<Id>[] = []
          
    tree.push({
      node: firstRoot,
      children: [],
    })

    for await (const { path } of toSteps(directedAcyclic)) {
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

export function createToCommonAncestors<
  Id extends string,
  Metadata
> (directedAcyclic: AsyncGraph<Id, Metadata>): GraphNodeTupleAsyncGeneratorFn<Id, GraphCommonAncestor<Id>> {
  const toNodeSteps = createToNodeSteps(directedAcyclic)

  return async function* (a, b) {
    for await (const { path: aPath } of toNodeSteps(a)) {
      for await (const { path: bPath } of toNodeSteps(b)) {
        for (let aPathIndex = aPath.length - 1; aPathIndex >= 0; aPathIndex--) {
          for (let bPathIndex = bPath.length - 1; bPathIndex >= 0; bPathIndex--) {
            if (
              aPath[aPathIndex] === bPath[bPathIndex]
              && !includes(aPath[aPathIndex])([a, b])
            ) {
              yield {
                node: aPath[aPathIndex],
                distances: {
                  [a]: aPath.length - aPathIndex - 1,
                  [b]: bPath.length - bPathIndex - 1,
                },
              } as GraphCommonAncestor<Id>
            }
          }
        }
      }
    }
  }
}

export function createPredicateAncestor<
  Id extends string,
  Metadata
> (directedAcyclic: AsyncGraph<Id, Metadata>): GraphNodeTupleAsyncFn<Id, boolean> {
  const toNodeSteps = createToNodeSteps(directedAcyclic)

  return async function (descendant, ancestor) {
    return await pipe(
      toNodeSteps,
      some<GraphStep<Id, Metadata>>(({ path }) => includes(ancestor)(path) as boolean)
    )(descendant)
  }
}

export function createToNodeSteps<
  Id extends string,
  Metadata
> (
  directedAcyclic: AsyncGraph<Id, Metadata>,
  options: { createToSteps?: CreateToStepsOptions<Id, Metadata> } = {}
): GraphNodeAsyncGeneratorFn<Id, GraphStep<Id, Metadata>> {
  const toSteps = createToSteps<Id, Metadata>(options.createToSteps)

  return async function* (node) {
    yield* await pipe(
      toSteps,
      filter(({ path }) => path.at(-1) === node),
    )(directedAcyclic)
  }
}

export type CreateToStepsOptions<Id extends string, Metadata> = CreateDirectedAcyclicToStepsOptions<Id, Metadata>

export function createToSteps<
  Id extends string,
  Metadata
> (
  options: CreateToStepsOptions<Id, Metadata> = {}
): AsyncGraphAsyncGeneratorFn<Id, Metadata, GraphStep<Id, Metadata>> {
  const { toUnsetMetadata, toMockMetadata, root, kind } = { ...defaultCreateToStepsOptions, ...options } as CreateToStepsOptions<Id, Metadata>  

  return async function* (directedAcyclic) {    
    const { nodes } = directedAcyclic,
          toOutdegree = createToOutdegree(directedAcyclic),
          toPath = createToPath(directedAcyclic),
          roots = pipe(
            createToRoots<Id, Metadata, typeof directedAcyclic>({ kind }),
            toArray(),
          )(directedAcyclic),
          state = {} as GraphState<Id, Metadata>,
          totalConnectionsFollowedByNode = {} as Record<GraphNode<Id>, number>,
          predicateExhausted = (node: GraphNode<Id>) => {
            return totalConnectionsFollowedByNode[node] === toOutdegree(node)
          }

    for (const node of nodes) {
      state[node] = {
        status: 'unset',
        metadata: toUnsetMetadata(node),
      }
    }

    let location = root || at(0)(roots) as GraphNode<Id>

    const path = await toPath(state)

    yield { path, state: JSON.parse(JSON.stringify(state)) }

    async function* toStep (): AsyncGenerator<GraphStep<Id, Metadata>> {  
      if (predicateExhausted(location)) {
        if (includes(location)(roots)) return
  
        state[location].status = 'unset'
        state[location].metadata = toUnsetMetadata(location)
  
        const path = await toPath(state)
        location = path.at(-2)
  
        yield* await toStep()
        return
      }
      
      if (!(location in totalConnectionsFollowedByNode)) totalConnectionsFollowedByNode[location] = 0
  
      state[location].status = 'set'
      state[location].metadata = toMockMetadata(location, totalConnectionsFollowedByNode[location])
      
      const path = await toPath(state)      
  
      yield { path, state: JSON.parse(JSON.stringify(state)) }
  
      totalConnectionsFollowedByNode[location]++
  
      const newLocation = path.at(-1)
  
      if (toOutdegree(newLocation) > 0) location = newLocation
  
      yield* await toStep()
    }
  
    yield* await toStep()
  }
}

// TODO: root option, multi root support
export function createToPath<
  Id extends string,
  Metadata
> (directedAcyclic: AsyncGraph<Id, Metadata>): GraphStateAsyncFn<Id, Metadata, GraphNode<Id>[]> {
  const toOutdegree = createToOutdegree<Id, Metadata, typeof directedAcyclic>(directedAcyclic),
        toOutgoing = createToOutgoing<Id, Metadata, typeof directedAcyclic>(directedAcyclic),
        firstRoot = pipe<typeof directedAcyclic>(
          createToRoots<Id, Metadata, typeof directedAcyclic>(),
          at(0)
        )(directedAcyclic) as GraphNode<Id>

  return async state => {
    const path = [firstRoot],
          getLastOutdegree = () => toOutdegree(path.at(-1)),
          getLastStatus = () => state[path.at(-1)].status

    while (getLastOutdegree() > 0 && getLastStatus() === 'set') {
      const edge = await pipe(
              toOutgoing,
              toArray(),
              createFindAsync<AsyncGraphEdge<Id, Metadata>>(
                async ({ predicateTraversable }) => await predicateTraversable(state)
              )
            )(path.at(-1)) as AsyncGraphEdge<Id, Metadata>

      path.push(edge.to)
    }

    return path
  }
}
