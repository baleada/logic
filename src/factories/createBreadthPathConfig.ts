import { pipe, at } from 'lazy-collections'
import type { Graph, GraphAsync } from '../extracted'
import { createOnlyChild, createOutgoing } from '../pipes'
import type { CreatePathConfig } from '../pipes'

export function createBreadthPathConfig<
  Id extends string,
  Metadata
> (
  directedAcyclic: Graph<Id, Metadata> | GraphAsync<Id, Metadata>
): CreatePathConfig<Id, Metadata> {
  const predicateOnlyChild = createOnlyChild<Id, Metadata, typeof directedAcyclic>(directedAcyclic),
        predicatePathable: CreatePathConfig<Id, Metadata>['predicatePathable'] = node => !predicateOnlyChild(node),
        toTraversalCandidates: CreatePathConfig<Id, Metadata>['toTraversalCandidates'] = path => pipe(
          at(-2),
          createOutgoing<Id, Metadata, typeof directedAcyclic>(directedAcyclic)
        )(path)

  return { predicatePathable, toTraversalCandidates }
}
