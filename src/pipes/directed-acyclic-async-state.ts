import { pipe, at, toArray } from 'lazy-collections'
import type {
  GraphAsync,
  GraphNode,
  GraphAsyncEdge,
  GraphPath,
} from '../extracted'
import { createFindAsync } from './array-async'
import type { GraphAsyncStateTransform } from './graph-async-state'
import { createRoots } from './directed-acyclic'
import type { CreatePathConfig } from './directed-acyclic-state'

// TODO: root option, multi root support
export function createPath<
  Id extends string,
  Metadata
> (
  directedAcyclicAsync: GraphAsync<Id, Metadata>,
  config: CreatePathConfig<Id, Metadata>,
): GraphAsyncStateTransform<Id, Metadata, GraphPath<Id>> {
  const { predicatePathable, toTraversalCandidates } = config,
        firstRoot = pipe<typeof directedAcyclicAsync>(
          createRoots<Id, Metadata, typeof directedAcyclicAsync>(),
          at(0)
        )(directedAcyclicAsync) as GraphNode<Id>

  return async state => {
    const path = [firstRoot],
          getLastPathable = () => predicatePathable(path.at(-1)),
          getLastStatus = () => state[path.at(-1)].status

    while (getLastPathable() && getLastStatus() === 'set') {
      const edge = await pipe(
              toTraversalCandidates,
              toArray(),
              createFindAsync<GraphAsyncEdge<Id, Metadata>>(
                async ({ predicateShouldTraverse }) => await predicateShouldTraverse(state)
              )
            )(path) as GraphAsyncEdge<Id, Metadata>

      path.push(edge.to)
    }

    return path
  }
}
