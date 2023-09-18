import {
  filter,
  pipe,
  some,
  includes,
} from 'lazy-collections'
import type {
  Graph,
  GraphStep,
  GraphCommonAncestor,
} from '../extracted'
import type {
  GraphNodeGeneratorTransform,
  GraphNodeTupleTransform,
  GraphNodeTupleGeneratorTransform,
} from './graph-node'
import { createDepthFirstSteps } from './directed-acyclic'
import type { CreateDepthFirstStepsOptions } from './directed-acyclic'

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/directed-acyclic-common-ancestors)
 */
export function createCommonAncestors<
  Id extends string,
  Metadata
> (directedAcyclic: Graph<Id, Metadata>): GraphNodeTupleGeneratorTransform<Id, GraphCommonAncestor<Id>> {
  const toNodeDepthFirstSteps = createNodeDepthFirstSteps(directedAcyclic)

  return function* (a, b) {
    for (const { path: aPath } of toNodeDepthFirstSteps(a)) {
      for (const { path: bPath } of toNodeDepthFirstSteps(b)) {
        for (let aPathIndex = aPath.length - 1; aPathIndex >= 0; aPathIndex--) {
          for (let bPathIndex = bPath.length - 1; bPathIndex >= 0; bPathIndex--) {
            if (
              aPath[aPathIndex] === bPath[bPathIndex]
              && !includes(aPath[aPathIndex])([a, b])
            ) {
              yield {
                node: aPath[aPathIndex],
                distances: {
                  [a]: aPath.length - aPathIndex - 1,
                  [b]: bPath.length - bPathIndex - 1,
                },
              } as GraphCommonAncestor<Id>
            }
          }
        }
      }
    }
  }
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/directed-acyclic-ancestor)
 */
export function createAncestor<
  Id extends string,
  Metadata
> (directedAcyclic: Graph<Id, Metadata>): GraphNodeTupleTransform<Id, boolean> {
  const toNodeDepthFirstSteps = createNodeDepthFirstSteps(directedAcyclic)

  return function (descendant, ancestor) {
    return pipe(
      toNodeDepthFirstSteps,
      some<GraphStep<Id, Metadata>>(({ path }) => includes(ancestor)(path) as boolean)
    )(descendant)
  }
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/directed-acyclic-node-depth-first-steps)
 */
export function createNodeDepthFirstSteps<
  Id extends string,
  Metadata
> (
  directedAcyclic: Graph<Id, Metadata>,
  options: { createDepthFirstSteps?: CreateDepthFirstStepsOptions<Id, Metadata> } = {}
): GraphNodeGeneratorTransform<Id, GraphStep<Id, Metadata>> {
  const toSteps = createDepthFirstSteps<Id, Metadata>(options.createDepthFirstSteps)

  return function* (node) {
    yield* pipe(
      toSteps,
      filter(({ path }) => path.at(-1) === node),
    )(directedAcyclic)
  }
}
