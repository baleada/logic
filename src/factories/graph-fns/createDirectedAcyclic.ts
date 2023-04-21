import { find } from 'lazy-collections'
import { createFilter } from '../../pipes'
import {
  GraphNode,
  GraphEdge,
  GraphState,
  GraphTraversal,
  GraphSharedAncestor
} from './types'

export type DirectedAcyclic<
  Id extends string = string,
  Metadata = any,
> = {
  toSharedAncestors: (a: GraphNode<Id>, b: GraphNode<Id>) => GraphSharedAncestor<Id>[],
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
  toIndegree: (id: Id) => number,
  toOutdegree: (id: Id) => number,
  toIncoming: (id: Id) => GraphEdge<Id, Metadata>[],
  toOutgoing: (id: Id) => GraphEdge<Id, Metadata>[],
}

export function createDirectedAcyclic<
  Id extends string = string,
  Metadata = any,
> (
  nodes: GraphNode<Id>[],
  edges: GraphEdge<Id, Metadata>[],
  toUnsetMetadata: ((node: GraphNode<Id>) => Metadata),
  toMockMetadata: (node: GraphNode<Id>, totalConnectionsFollowed: number) => Metadata,
): DirectedAcyclic<Id, Metadata> {
  const unsetState = {} as GraphState<Id, Metadata>
  for (const node of nodes) {
    unsetState[node] = {
      status: 'unset',
      metadata: toUnsetMetadata(node),
    }
  }

  const toSharedAncestors: DirectedAcyclic<Id, Metadata>['toSharedAncestors'] = (a, b) => {
    const aTraversals = toTraversals(a),
          bTraversals = toTraversals(b),
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
                }
              } as GraphSharedAncestor<Id>)
            }
          }
        }
      }
    }

    return sharedAncestors
  }

  const toTraversals: DirectedAcyclic<Id, Metadata>['toTraversals'] = node => {
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

  const walk: DirectedAcyclic<Id, Metadata>['walk'] = (stepEffect, options = {}) => {
    const { entry } = options,
          state: GraphState<Id, Metadata> = JSON.parse(JSON.stringify(unsetState)),
          stop = () => {
            status = 'stopped'
          },
          totalConnectionsFollowedByNode = {} as Record<GraphNode<Id>, number>
  
    let location = entry
      || find<GraphNode<Id>>(node => toIndegree(node) === 0)(nodes) as GraphNode<Id>
    let status: 'walking' | 'stopped' = 'walking'

    stepEffect(
      toPath(unsetState),
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

  const toPath: DirectedAcyclic<Id, Metadata>['toPath'] = state => {
    const path = [
            find<GraphNode<Id>>(
              node => toIndegree(node) === 0
            )(nodes) as GraphNode<Id>
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

  const toIndegree: DirectedAcyclic<Id, Metadata>['toIndegree'] = node => {
    return toIncoming(node).length
  }

  const toOutdegree: DirectedAcyclic<Id, Metadata>['toOutdegree'] = node => {
    return toOutgoing(node).length
  }

  const toIncoming: DirectedAcyclic<Id, Metadata>['toIncoming'] = node => {
    return createFilter<GraphEdge<Id, Metadata>>(({ to }) => to === node)(edges)
  }
  
  const toOutgoing: DirectedAcyclic<Id, Metadata>['toOutgoing'] = node => {
    return createFilter<GraphEdge<Id, Metadata>>(({ from }) => from === node)(edges)
  }

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
