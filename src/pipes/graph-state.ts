import { find } from 'lazy-collections'
import type { Graph, GraphVertex, GraphEdge } from '../extracted'
import type { GraphStateFn } from './types'
import {
  createToIndegree as createGraphVertexToIndegree,
  createToOutdegree as createGraphVertexToOutdegree,
  createToOutgoing as createGraphVertexToOutgoing,
} from './graph-vertex'

export function createToPath<
  Id extends string,
  Metadata
> (graph: Graph<Id, Metadata>): GraphStateFn<Id, Metadata, GraphVertex<Id>[]> {
  const { nodes } = graph,
        toIndegree = createGraphVertexToIndegree(graph),
        toOutdegree = createGraphVertexToOutdegree(graph),
        toOutgoing = createGraphVertexToOutgoing(graph)

  return state => {
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
}
