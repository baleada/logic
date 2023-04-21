import { find, some } from 'lazy-collections'
import type { Expand, Graph } from '../extracted'
import type {
  GraphVertex,
  GraphEdge,
  GraphState,
  GraphTraversal,
  GraphCommonAncestor,
  GraphTreeNode,
} from '../extracted'
import { createMap } from '../pipes'
import type { GraphFns } from './createGraphFns'
import { createGraphFns } from './createGraphFns'

export type CreateDirectedAcyclicFnsOptions<Id extends string, Metadata> = {
  toUnsetMetadata?: (node: GraphVertex<Id>) => Metadata,
  toMockMetadata?: (node: GraphVertex<Id>, totalConnectionsFollowed: number) => Metadata,
  kind?: 'directed acyclic' | 'multitree' | 'arborescence'
}

export type DirectedAcyclicFns<
  Id extends string,
  Metadata
> = Expand<GraphFns<Id, Metadata, GraphEdge<Id, Metadata>> & {
  toTree: (options?: { entry?: Id }) => GraphTreeNode<Id>[],
  createCommonAncestors: (a: GraphVertex<Id>) => (b: GraphVertex<Id>) => GraphCommonAncestor<Id>[],
  createPredicateAncestor: (node: GraphVertex<Id>) => (ancestor: GraphVertex<Id>) => boolean,
  toTraversals: (node: GraphVertex<Id>) => GraphTraversal<Id, Metadata>[],
  walk: (
    stepEffect: (
      path: GraphVertex<Id>[],
      state: GraphState<Id, Metadata>,
      stop: () => void,
    ) => void,
    options?: { entry?: Id },
  ) => void,
  toPath: (state: GraphState<Id, Metadata>) => GraphVertex<Id>[],
}>

export const defaultOptions: CreateDirectedAcyclicFnsOptions<string, any> = {
  toUnsetMetadata: () => 0,
  toMockMetadata: (node, totalConnectionsFollowed) => totalConnectionsFollowed,
  kind: 'directed acyclic',
}

export function createDirectedAcyclicFns<
  Id extends string,
  Metadata
> (
  graph: Graph<Id, Metadata>,
  options: CreateDirectedAcyclicFnsOptions<Id, Metadata> = {},
): DirectedAcyclicFns<Id, Metadata> {
  const { nodes, edges } = graph,
        { toUnsetMetadata, toMockMetadata, kind } = { ...defaultOptions, ...options },
        unsetState = {} as GraphState<Id, Metadata> 

  for (const node of nodes) {
    unsetState[node] = {
      status: 'unset',
      metadata: toUnsetMetadata(node),
    }
  }

  const toTree: DirectedAcyclicFns<Id, Metadata>['toTree'] = (options = {}) => {
    const { entry } = options,
          tree: GraphTreeNode<Id>[] = [
            {
              node: entry || toEntry(),
              children: [],
            },
          ],
          createFindInTree = (node: GraphVertex<Id>) => {
            return (tree: GraphTreeNode<Id>[]) => {
              for (const treeNode of tree) {
                if (treeNode.node === node) return treeNode

                const found = createFindInTree(node)(treeNode.children)
                if (found) return found
              }
            }
          }

    walk(path => {
      const node = path.at(-1),
            parent = path.at(-2)

      if (parent) {
        const parentTreeNode = createFindInTree(parent)(tree)
        // console.log({ parentTreeNode })
        if (parentTreeNode) {
          parentTreeNode.children.push({
            node,
            children: [],
          })
        }
      }
    })

    return tree
  }

  const createCommonAncestors: DirectedAcyclicFns<Id, Metadata>['createCommonAncestors'] = a => {
    const aTraversals = toTraversals(a)

    return b => {
      const bTraversals = toTraversals(b),
            commonAncestors: GraphCommonAncestor<Id>[] = []

      for (const { path: aPath } of aTraversals) {
        for (const { path: bPath } of bTraversals) {
          for (let aPathIndex = aPath.length - 1; aPathIndex >= 0; aPathIndex--) {
            for (let bPathIndex = bPath.length - 1; bPathIndex >= 0; bPathIndex--) {
              if (
                aPath[aPathIndex] === bPath[bPathIndex]
                && ![a, b].includes(aPath[aPathIndex])
              ) {
                commonAncestors.push({
                  node: aPath[aPathIndex],
                  distances: {
                    [a]: aPath.length - aPathIndex - 1,
                    [b]: bPath.length - bPathIndex - 1,
                  },
                } as GraphCommonAncestor<Id>)
              }
            }
          }
        }
      }
  
      return commonAncestors
    }
  }

  const createPredicateAncestor: DirectedAcyclicFns<Id, Metadata>['createPredicateAncestor'] = descendant => {
    const traversals = toTraversals(descendant),
          paths = createMap<GraphTraversal<Id, Metadata>, Id[]>(
            traversal => toPath(traversal.state)
          )(traversals)

    return ancestor => some<Id[]>(path => path.includes(ancestor))(paths) as boolean
  }

  const toTraversals: DirectedAcyclicFns<Id, Metadata>['toTraversals'] = node => {
    const traversals: GraphTraversal<Id, Metadata>[] = []
    
    walk((path, state, stop) => {
      if (path.at(-1) === node) {
        traversals.push({
          path,
          state,
        })

        if (kind === 'arborescence') stop()
      }
    })

    return traversals
  }

  const walk: DirectedAcyclicFns<Id, Metadata>['walk'] = (stepEffect, options = {}) => {
    const { entry } = options,
          state: GraphState<Id, Metadata> = JSON.parse(JSON.stringify(unsetState)),
          stop = () => {
            status = 'stopped'
          },
          totalConnectionsFollowedByNode = {} as Record<GraphVertex<Id>, number>
  
    let location = entry || toEntry()
    let status: 'walking' | 'stopped' = 'walking'

    const path = toPath(unsetState)

    stepEffect(
      path,
      JSON.parse(JSON.stringify(unsetState)),
      stop,
    )
  
    function step () {
      if (status === 'stopped') return

      const isExhausted = totalConnectionsFollowedByNode[location] === toOutdegree(location)

      if (isExhausted) {
        if (toIndegree(location) === 0) return

        state[location].status = 'unset'
        state[location].metadata = toUnsetMetadata(location)

        const path = toPath(state)
        location = path.at(-2)

        step()
        return
      }
      
      if (!(location in totalConnectionsFollowedByNode)) totalConnectionsFollowedByNode[location] = 0

      state[location].status = 'set'
      state[location].metadata = toMockMetadata(location, totalConnectionsFollowedByNode[location])
      
      const path = toPath(state)

      stepEffect(
        path,
        JSON.parse(JSON.stringify(state)),
        stop
      )

      totalConnectionsFollowedByNode[location]++

      const newLocation = path.at(-1)

      if (toOutdegree(newLocation) > 0) location = newLocation

      step()
    }
  
    step()
  }

  const toPath: DirectedAcyclicFns<Id, Metadata>['toPath'] = state => {
    const path = [
            find<GraphVertex<Id>>(
              node => toIndegree(node) === 0
            )(nodes) as GraphVertex<Id>,
          ],
          getLastOutdegree = () => toOutdegree(path.at(-1)),
          getLastStatus = () => state[path.at(-1)].status
  
    while (getLastOutdegree() > 0 && getLastStatus() === 'set') {
      const outgoing = toOutgoing(path.at(-1)),
            edge = find<GraphEdge<Id, Metadata>>(
              ({ predicateTraversable }) => predicateTraversable(state)
            )(outgoing) as GraphEdge<Id, Metadata>
  
      path.push(edge.to)
    }
  
    return path
  }

  const {
    toIndegree,
    toOutdegree,
    toIncoming,
    toOutgoing,
    toEntry,
  } = createGraphFns(nodes, edges)

  return {
    toTree,
    createCommonAncestors,
    createPredicateAncestor,
    toTraversals,
    walk,
    toPath,
    toIndegree,
    toOutdegree,
    toIncoming,
    toOutgoing,
    toEntry,
  }
}
