import { find } from 'lazy-collections'
import type { Expand } from '../../extracted'
import type { GraphFns } from './createGraphFns'
import { createGraphFns } from './createGraphFns'
import type {
  GraphNode,
  GraphEdge,
  GraphState,
  GraphTraversal,
  GraphCommonAncestor,
  GraphTreeNode,
} from './types'

export type DirectedAcyclicFns<
  Id extends string,
  Metadata
> = Expand<GraphFns<Id, Metadata, GraphEdge<Id, Metadata>> & {
  toTree: (options?: { entry?: Id }) => GraphTreeNode<Id>[],
  toCommonAncestors: (a: GraphNode<Id>, b: GraphNode<Id>) => GraphCommonAncestor<Id>[],
  toTraversals: (node: GraphNode<Id>) => GraphTraversal<Id, Metadata>[],
  walk: (
    stepEffect: (
      path: GraphNode<Id>[],
      state: GraphState<Id, Metadata>,
      stop: () => void,
    ) => void,
    options?: { entry?: Id },
  ) => void,
  toPath: (state: GraphState<Id, Metadata>) => GraphNode<Id>[],
}>

export function createDirectedAcyclicFns<
  Id extends string,
  Metadata
> (
  nodes: GraphNode<Id>[],
  edges: GraphEdge<Id, Metadata>[],
  toUnsetMetadata: ((node: GraphNode<Id>) => Metadata),
  toMockMetadata: (node: GraphNode<Id>, totalConnectionsFollowed: number) => Metadata,
): DirectedAcyclicFns<Id, Metadata> {
  const unsetState = {} as GraphState<Id, Metadata>
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
          createFindInTree = (node: GraphNode<Id>) => {
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

  const toCommonAncestors: DirectedAcyclicFns<Id, Metadata>['toCommonAncestors'] = (a, b) => {
    const aTraversals = toTraversals(a),
          bTraversals = toTraversals(b),
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

  const toTraversals: DirectedAcyclicFns<Id, Metadata>['toTraversals'] = node => {
    const traversals: GraphTraversal<Id, Metadata>[] = []
    
    walk((path, state) => {
      if (path.at(-1) === node) {
        traversals.push({
          path,
          state,
        })
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
          totalConnectionsFollowedByNode = {} as Record<GraphNode<Id>, number>
  
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
            find<GraphNode<Id>>(
              node => toIndegree(node) === 0
            )(nodes) as GraphNode<Id>,
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
    toCommonAncestors,
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