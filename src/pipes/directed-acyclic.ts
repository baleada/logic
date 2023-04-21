import type { GraphVertex } from '../extracted'
import type { GraphFn } from './types'
import {
  createToIndegree as createGraphVertexToIndegree,
} from './graph-vertex'

export function createToRoots<
  Id extends string,
  Metadata
> (options: { kind?: 'directed acyclic' | 'arborescence' } = {}): GraphFn<Id, Metadata, GraphVertex<Id>[]> {
  return graph => {
    const { nodes } = graph,
          toIndegree = createGraphVertexToIndegree(graph),
          roots: GraphVertex<Id>[] = []

    for (const node of nodes) {
      if (toIndegree(node) === 0) roots.push(node)
      if (options.kind === 'arborescence') break
    }

    return roots
  }
}
