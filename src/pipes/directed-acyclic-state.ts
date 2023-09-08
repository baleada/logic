import { pipe, at, find } from 'lazy-collections'
import type {
  Graph,
  GraphNode,
  GraphEdge,
  GraphPath,
} from '../extracted'
import type { GraphStateTransform } from './graph-state'
import { createRoots } from './directed-acyclic'

export type CreatePathConfig<
  Id extends string,
  Metadata
> = {
  predicatePathable: (node: GraphNode<Id>) => boolean,
  toTraversalCandidates: (path: GraphPath<Id>) => Iterable<GraphEdge<Id, Metadata>>,
}

// TODO: root option, multi root support, breadth-first support
export function createPath<
  Id extends string,
  Metadata
> (
  directedAcyclic: Graph<Id, Metadata>,
  config: CreatePathConfig<Id, Metadata>,
): GraphStateTransform<Id, Metadata, GraphPath<Id>> {
  const { predicatePathable, toTraversalCandidates } = config,
        firstRoot = pipe<typeof directedAcyclic>(
          createRoots<Id, Metadata, typeof directedAcyclic>(),
          at(0)
        )(directedAcyclic) as GraphNode<Id>

  return state => {
    const path = [firstRoot],
          getLastPathable = () => predicatePathable(path.at(-1)),
          getLastStatus = () => state[path.at(-1)].status

    while (getLastPathable() && getLastStatus() === 'set') {
      const edge = pipe(
              toTraversalCandidates,
              find<GraphEdge<Id, Metadata>>(
                ({ predicateShouldTraverse }) => predicateShouldTraverse(state)
              ),
            )(path) as GraphEdge<Id, Metadata>            

      path.push(edge.to)
    }

    return path
  }
}
