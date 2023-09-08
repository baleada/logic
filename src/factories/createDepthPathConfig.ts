import { pipe, at } from 'lazy-collections'
import type { Graph, GraphAsync } from '../extracted'
import { createOutgoing, createTerminal } from '../pipes'
import type { CreatePathConfig } from '../pipes'

export function createDepthPathConfig<
  Id extends string,
  Metadata
> (
  directedAcyclic: Graph<Id, Metadata> | GraphAsync<Id, Metadata>
): CreatePathConfig<Id, Metadata> {
  const predicateTerminal = createTerminal<Id, Metadata, typeof directedAcyclic>(directedAcyclic),
        predicatePathable: CreatePathConfig<Id, Metadata>['predicatePathable'] = node => !predicateTerminal(node),
        toTraversalCandidates: CreatePathConfig<Id, Metadata>['toTraversalCandidates'] = path => pipe(
          at(-1),
          createOutgoing<Id, Metadata, typeof directedAcyclic>(directedAcyclic)
        )(path)
  
  return { predicatePathable, toTraversalCandidates }
}
