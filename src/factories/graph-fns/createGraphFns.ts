import { createFilter } from '../../pipes'
import type {
  GraphNode,
  GraphEdge,
  GraphEdgeAsync,
} from './types'

export type GraphFns<
  Id extends string,
  Metadata,
  Edge extends GraphEdge<Id, Metadata> | GraphEdgeAsync<Id, Metadata>
> = {
  toIndegree: (id: Id) => number,
  toOutdegree: (id: Id) => number,
  toIncoming: (id: Id) => Edge[],
  toOutgoing: (id: Id) => Edge[],
}

export function createGraphFns<
  Id extends string,
  Metadata,
  Edge extends GraphEdge<Id, Metadata> | GraphEdgeAsync<Id, Metadata>
> (
  nodes: GraphNode<Id>[],
  edges: Edge[],
): GraphFns<Id, Metadata, Edge> {
  const toIndegree: GraphFns<Id, Metadata, Edge>['toIndegree'] = node => {
    return toIncoming(node).length
  }

  const toOutdegree: GraphFns<Id, Metadata, Edge>['toOutdegree'] = node => {
    return toOutgoing(node).length
  }

  const toIncoming: GraphFns<Id, Metadata, Edge>['toIncoming'] = node => {
    return createFilter<typeof edges[0]>(({ to }) => to === node)(edges)
  }
  
  const toOutgoing: GraphFns<Id, Metadata, Edge>['toOutgoing'] = node => {
    return createFilter<typeof edges[0]>(({ from }) => from === node)(edges)
  }

  return {
    toIndegree,
    toOutdegree,
    toIncoming,
    toOutgoing,
  }
}
