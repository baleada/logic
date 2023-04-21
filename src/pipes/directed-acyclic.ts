import { filter, find, pipe, some, toArray } from 'lazy-collections'
import { at, includes } from '../extracted'
import type {
  Graph,
  GraphNode,
  GraphEdge,
  GraphState,
  GraphStep,
  GraphCommonAncestor,
  GraphTreeNode,
  AsyncGraph,
} from '../extracted'
import {
  createToOutdegree,
  createToOutgoing,
} from './graph'
import type {
  GraphGeneratorFn,
  GraphNodeGeneratorFn,
  GraphStateFn,
  GraphNodeTupleFn,
  GraphNodeTupleGeneratorFn,
  GraphFn,
  AsyncGraphGeneratorFn,
} from './types'
import { createPredicateRoot } from './graph'
import { createFind as createTreeFind } from './tree'

// TODO: root option, multiple roots
export function createToTree<
  Id extends string,
  Metadata
>(options: { createToSteps?: CreateToStepsOptions<Id, Metadata> } = {}): GraphFn<Id, Metadata, GraphTreeNode<Id>[]> {
  const toSteps = createToSteps<Id, Metadata>(options.createToSteps)

  return function toTree (directedAcyclic) {
    const firstRoot = pipe(
            createToRoots<Id, Metadata, typeof directedAcyclic>(),
            at(0),
          )(directedAcyclic) as GraphNode<Id>,
          tree: GraphTreeNode<Id>[] = []
          
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

export function createToCommonAncestors<
  Id extends string,
  Metadata
> (directedAcyclic: Graph<Id, Metadata>): GraphNodeTupleGeneratorFn<Id, GraphCommonAncestor<Id>> {
  const toNodeSteps = createToNodeSteps(directedAcyclic)

  return function* (a, b) {
    for (const { path: aPath } of toNodeSteps(a)) {
      for (const { path: bPath } of toNodeSteps(b)) {
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
> (directedAcyclic: Graph<Id, Metadata>): GraphNodeTupleFn<Id, boolean> {
  const toNodeSteps = createToNodeSteps(directedAcyclic)

  return function (descendant, ancestor) {
    return pipe(
      toNodeSteps,
      some<GraphStep<Id, Metadata>>(({ path }) => includes(ancestor)(path))
    )(descendant)
  }
}

export function createToNodeSteps<
  Id extends string,
  Metadata
> (
  directedAcyclic: Graph<Id, Metadata>,
  options: { createToSteps?: CreateToStepsOptions<Id, Metadata> } = {}
): GraphNodeGeneratorFn<Id, GraphStep<Id, Metadata>> {
  const toSteps = createToSteps<Id, Metadata>(options.createToSteps)

  return function* (node) {
    yield* pipe(
      toSteps,
      filter(({ path }) => path.at(-1) === node),
    )(directedAcyclic)
  }
}

export type CreateToStepsOptions<
  Id extends string,
  Metadata
> = {
  root?: GraphNode<Id>,
  toMockMetadata?: (node: GraphNode<Id>, totalConnectionsFollowed: number) => Metadata,
  toUnsetMetadata?: (node: GraphNode<Id>) => Metadata,
  kind?: 'directed acyclic' | 'arborescence'
}

export const defaultCreateToStepsOptions: CreateToStepsOptions<string, any> = {
  toUnsetMetadata: () => 0,
  toMockMetadata: (node, totalConnectionsFollowed) => totalConnectionsFollowed,
  kind: 'directed acyclic',
}

export function createToSteps<
  Id extends string,
  Metadata
> (
  options: CreateToStepsOptions<Id, Metadata> = {}
): GraphGeneratorFn<Id, Metadata, GraphStep<Id, Metadata>> {
  const { toUnsetMetadata, toMockMetadata, root, kind } = { ...defaultCreateToStepsOptions, ...options } as CreateToStepsOptions<Id, Metadata>  

  return function* (directedAcyclic) {    
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

    let location = root || at<GraphNode<Id>>(0)(roots)

    const path = toPath(state)

    yield { path, state: JSON.parse(JSON.stringify(state)) }

    function* toStep (): Generator<GraphStep<Id, Metadata>> {  
      if (predicateExhausted(location)) {
        if (includes(location)(roots)) return
  
        state[location].status = 'unset'
        state[location].metadata = toUnsetMetadata(location)
  
        const path = toPath(state)
        location = path.at(-2)
  
        yield* toStep()
        return
      }
      
      if (!(location in totalConnectionsFollowedByNode)) totalConnectionsFollowedByNode[location] = 0
  
      state[location].status = 'set'
      state[location].metadata = toMockMetadata(location, totalConnectionsFollowedByNode[location])
      
      const path = toPath(state)      
  
      yield { path, state: JSON.parse(JSON.stringify(state)) }
  
      totalConnectionsFollowedByNode[location]++
  
      const newLocation = path.at(-1)
  
      if (toOutdegree(newLocation) > 0) location = newLocation
  
      yield* toStep()
    }
  
    yield* toStep()
  }
}

// TODO: root option, multi root support
export function createToPath<
  Id extends string,
  Metadata
> (directedAcyclic: Graph<Id, Metadata>): GraphStateFn<Id, Metadata, GraphNode<Id>[]> {
  const toOutdegree = createToOutdegree<Id, Metadata, typeof directedAcyclic>(directedAcyclic),
        toOutgoing = createToOutgoing<Id, Metadata, typeof directedAcyclic>(directedAcyclic),
        firstRoot = pipe<typeof directedAcyclic>(
          createToRoots<Id, Metadata, typeof directedAcyclic>(),
          at(0)
        )(directedAcyclic) as GraphNode<Id>

  return state => {
    const path = [firstRoot],
          getLastOutdegree = () => toOutdegree(path.at(-1)),
          getLastStatus = () => state[path.at(-1)].status

    while (getLastOutdegree() > 0 && getLastStatus() === 'set') {
      const edge = pipe(
              toOutgoing,
              find<GraphEdge<Id, Metadata>>(
                ({ predicateTraversable }) => predicateTraversable(state)
              ),
            )(path.at(-1)) as GraphEdge<Id, Metadata>

      path.push(edge.to)
    }

    return path
  }
}

export function createToRoots<
  Id extends string,
  Metadata,
  GraphType extends Graph<Id, Metadata> | AsyncGraph<Id, Metadata> = Graph<Id, Metadata>
> (options: { kind?: 'directed acyclic' | 'arborescence' } = {}): (
  GraphType extends AsyncGraph<Id, Metadata>
    ? AsyncGraphGeneratorFn<Id, Metadata, GraphNode<Id>>
    : GraphGeneratorFn<Id, Metadata, GraphNode<Id>>
 ) {
  return function* (directedAcyclic) {
    const { nodes } = directedAcyclic

    for (const node of nodes) {
      if (createPredicateRoot(directedAcyclic)(node)) yield node
      if (options.kind === 'arborescence') break
    }
  }
}
