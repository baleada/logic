import { pipe } from 'lazy-collections'
import { at } from '../extracted'
import type { Graph, GraphNode, GraphState } from '../extracted'
import {
  createToIndegree as createGraphNodeToIndegree,
  createToOutdegree as createGraphNodeToOutdegree,
} from '../pipes/graph-node'
import { createGenerateRoots } from '../pipes/directed-acyclic'
import { createToPath } from '../pipes/directed-acyclic-state'







export const defaultWalkOptions: ToStepsOptions<string, any> = {
}

export function createToSteps<
  Id extends string,
  Metadata
> (
  graph: Graph<Id, Metadata>,
  options: CreateToStepsOptions<Id, Metadata> = {}
) {
  const { nodes } = graph,
        { toUnsetMetadata } = { ...defaultOptions, ...options },
        toIndegree = createGraphNodeToIndegree(graph),
        toOutdegree = createGraphNodeToOutdegree(graph),
        toPath = createToPath(graph),
        firstRoot = pipe(
          createGenerateRoots<Id, Metadata>()(graph),
          at(0)
        )(),
        unsetState = {} as GraphState<Id, Metadata>

  for (const node of nodes) {
    unsetState[node] = {
      status: 'unset',
      metadata: toUnsetMetadata(node),
    }
  }

  return function* toSteps (
    options: ToStepsOptions<Id, Metadata> = {}
  ): Generator<Step<Id, Metadata>> {
    const { root, toMockMetadata } = (
              {
              ...defaultOptions,
              ...options,
            } as ToStepsOptions<Id, Metadata>
          ),
          state: GraphState<Id, Metadata> = JSON.parse(JSON.stringify(unsetState)),
          totalConnectionsFollowedByNode = {} as Record<GraphNode<Id>, number>

    let location = root || firstRoot
  
    const path = toPath(unsetState)

    yield [path, JSON.parse(JSON.stringify(unsetState))]

    function* toStep (): Generator<Step<Id, Metadata>> {
      const isExhausted = totalConnectionsFollowedByNode[location] === toOutdegree(location)
  
      if (isExhausted) {
        if (toIndegree(location) === 0) return
  
        state[location].status = 'unset'
        state[location].metadata = toUnsetMetadata(location)
  
        const path = toPath(state)
        location = path.at(-2)
  
        yield * toStep()
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
  
      yield * toStep()
    }
  
    yield * toStep()
  }
}
