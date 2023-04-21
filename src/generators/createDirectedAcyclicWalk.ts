import type { Graph, GraphVertex, GraphState } from '../extracted'
import {
  createToIndegree as createGraphVertexToIndegree,
  createToOutdegree as createGraphVertexToOutdegree,
} from '../pipes/graph-vertex'
import { createToRoots } from '../pipes/directed-acyclic'
import { createToPath } from '../pipes/graph-state'

export type CreateDirectedAcyclicWalkOptions<
  Id extends string,
  Metadata
> = {
  toUnsetMetadata?: (node: GraphVertex<Id>) => Metadata,
  toMockMetadata?: (node: GraphVertex<Id>, totalConnectionsFollowed: number) => Metadata,
  kind?: 'directed acyclic' | 'arborescence'
}

export type DirectedAcyclicWalkOptions<Id extends string> = { root?: GraphVertex<Id> }

export type DirectedAcyclicStep<
  Id extends string,
  Metadata
> = [GraphVertex<Id>[], GraphState<Id, Metadata>]

export const defaultOptions: CreateDirectedAcyclicWalkOptions<string, any> = {
  toUnsetMetadata: () => 0,
  toMockMetadata: (node, totalConnectionsFollowed) => totalConnectionsFollowed,
  kind: 'directed acyclic',
}

export function createWalk<
  Id extends string,
  Metadata
> (
  graph: Graph<Id, Metadata>,
  options: CreateDirectedAcyclicWalkOptions<Id, Metadata> = {}
) {
  const { nodes } = graph,
        { toUnsetMetadata, toMockMetadata, kind } = { ...defaultOptions, ...options },
        toIndegree = createGraphVertexToIndegree(graph),
        toOutdegree = createGraphVertexToOutdegree(graph),
        toPath = createToPath(graph),
        roots = createToRoots<Id, Metadata>({ kind })(graph),
        unsetState = {} as GraphState<Id, Metadata>

  for (const node of nodes) {
    unsetState[node] = {
      status: 'unset',
      metadata: toUnsetMetadata(node),
    }
  }

  return function* walk (
    options: DirectedAcyclicWalkOptions<Id> = {}
  ): Generator<DirectedAcyclicStep<Id, Metadata>> {
    const { root } = options,
          state: GraphState<Id, Metadata> = JSON.parse(JSON.stringify(unsetState)),
          totalConnectionsFollowedByNode = {} as Record<GraphVertex<Id>, number>

    let location = root || roots[0]
  
    const path = toPath(unsetState)

    yield [path, JSON.parse(JSON.stringify(unsetState))]

    function* step (): Generator<DirectedAcyclicStep<Id, Metadata>> {
      const isExhausted = totalConnectionsFollowedByNode[location] === toOutdegree(location)
  
      if (isExhausted) {
        if (toIndegree(location) === 0) return
  
        state[location].status = 'unset'
        state[location].metadata = toUnsetMetadata(location)
  
        const path = toPath(state)
        location = path.at(-2)
  
        yield * step()
        return
      }
      
      if (!(location in totalConnectionsFollowedByNode)) totalConnectionsFollowedByNode[location] = 0
  
      state[location].status = 'set'
      state[location].metadata = toMockMetadata(location, totalConnectionsFollowedByNode[location])
      
      const path = toPath(state)
  
      yield [path, JSON.parse(JSON.stringify(state))]
  
      totalConnectionsFollowedByNode[location]++
  
      const newLocation = path.at(-1)
  
      if (toOutdegree(newLocation) > 0) location = newLocation
  
      yield * step()
    }
  
    yield * step()
  }
}
