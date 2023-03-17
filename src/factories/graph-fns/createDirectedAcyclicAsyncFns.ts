import { find } from 'lazy-collections'
import { createFindAsync } from '../../pipes'
import { createGraphFns } from './createGraphFns'
import type {
  GraphNode,
  GraphEdgeAsync,
  GraphState,
  GraphTraversal,
  GraphSharedAncestor,
} from './types'

export type DirectedAcyclicFns<
  Id extends string,
  Metadata
> = {
  toSharedAncestors: (a: GraphNode<Id>, b: GraphNode<Id>) => Promise<GraphSharedAncestor<Id>[]>,
  toTraversals: (node: GraphNode<Id>) => Promise<GraphTraversal<Id, Metadata>[]>,
  walk: (
    stepEffect: (
      path: GraphNode<Id>[],
      state: GraphState<Id, Metadata>,
      stop: () => void,
    ) => void,
    options?: { entry?: Id },
  ) => Promise<void>,
  toPath: (state: GraphState<Id, Metadata>) => Promise<GraphNode<Id>[]>,
  toIndegree: (id: Id) => number,
  toOutdegree: (id: Id) => number,
  toIncoming: (id: Id) => GraphEdgeAsync<Id, Metadata>[],
  toOutgoing: (id: Id) => GraphEdgeAsync<Id, Metadata>[],
}

export function createDirectedAcyclicAsyncFns<
  Id extends string,
  Metadata
> (
  nodes: GraphNode<Id>[],
  edges: GraphEdgeAsync<Id, Metadata>[],
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

  const toSharedAncestors: DirectedAcyclicFns<Id, Metadata>['toSharedAncestors'] = async (a, b) => {
    const aTraversals = await toTraversals(a),
          bTraversals = await toTraversals(b),
          sharedAncestors: GraphSharedAncestor<Id>[] = []

    for (const { path: aPath } of aTraversals) {
      for (const { path: bPath } of bTraversals) {
        for (let aPathIndex = aPath.length - 1; aPathIndex >= 0; aPathIndex--) {
          for (let bPathIndex = bPath.length - 1; bPathIndex >= 0; bPathIndex--) {
            if (
              aPath[aPathIndex] === bPath[bPathIndex]
              && ![a, b].includes(aPath[aPathIndex])
            ) {
              sharedAncestors.push({
                node: aPath[aPathIndex],
                distances: {
                  [a]: aPath.length - aPathIndex - 1,
                  [b]: bPath.length - bPathIndex - 1,
                },
              } as GraphSharedAncestor<Id>)
            }
          }
        }
      }
    }

    return sharedAncestors
  }

  const toTraversals: DirectedAcyclicFns<Id, Metadata>['toTraversals'] = async node => {
    const traversals: GraphTraversal<Id, Metadata>[] = []
    
    await walk((path, state) => {
      if (path.at(-1) === node) {
        traversals.push({
          path,
          state,
        })
      }
    })

    return traversals
  }

  const walk: DirectedAcyclicFns<Id, Metadata>['walk'] = async (stepEffect, options = {}) => {
    const { entry } = options,
          state: GraphState<Id, Metadata> = JSON.parse(JSON.stringify(unsetState)),
          stop = () => {
            status = 'stopped'
          },
          totalConnectionsFollowedByNode = {} as Record<GraphNode<Id>, number>
  
    let location = entry
      || find<GraphNode<Id>>(node => toIndegree(node) === 0)(nodes) as GraphNode<Id>
    let status: 'walking' | 'stopped' = 'walking'

    const path = await toPath(unsetState)

    stepEffect(
      path,
      JSON.parse(JSON.stringify(unsetState)),
      stop,
    )
  
    async function step () {
      if (status === 'stopped') return

      const isExhausted = totalConnectionsFollowedByNode[location] === toOutdegree(location)

      if (isExhausted) {
        if (toIndegree(location) === 0) return

        state[location].status = 'unset'
        state[location].metadata = toUnsetMetadata(location)

        const path = await toPath(state)
        location = path.at(-2)

        await step()
        return
      }
      
      if (!(location in totalConnectionsFollowedByNode)) totalConnectionsFollowedByNode[location] = 0

      state[location].status = 'set'
      state[location].metadata = toMockMetadata(location, totalConnectionsFollowedByNode[location])
      
      const path = await toPath(state)

      stepEffect(
        path,
        JSON.parse(JSON.stringify(state)),
        stop
      )

      totalConnectionsFollowedByNode[location]++

      const newLocation = path.at(-1)

      if (toOutdegree(newLocation) > 0) location = newLocation

      await step()
    }
  
    await step()
  }

  const toPath: DirectedAcyclicFns<Id, Metadata>['toPath'] = async state => {
    const path = [
            find<GraphNode<Id>>(
              node => toIndegree(node) === 0
            )(nodes) as GraphNode<Id>,
          ],
          getLastOutdegree = () => toOutdegree(path.at(-1)),
          getLastStatus = () => state[path.at(-1)].status
  
    while (getLastOutdegree() > 0 && getLastStatus() === 'set') {
      const outgoing = toOutgoing(path.at(-1)),
            edge = await createFindAsync<GraphEdgeAsync<Id, Metadata>>(
              ({ predicateTraversable }) => predicateTraversable(state)
            )(outgoing)
  
      path.push(edge.to)
    }
  
    return path
  }

  const {
    toIndegree,
    toOutdegree,
    toIncoming,
    toOutgoing,
  } = createGraphFns(nodes, edges)

  return {
    toSharedAncestors,
    toTraversals,
    walk,
    toPath,
    toIndegree,
    toOutdegree,
    toIncoming,
    toOutgoing,
  }
}
