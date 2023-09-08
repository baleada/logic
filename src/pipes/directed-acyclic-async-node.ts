import {
  pipe,
  filter,
  some,
  includes,
} from 'lazy-collections'
import type {
  GraphStep,
  GraphAsync,
  GraphCommonAncestor,
} from '../extracted'
import type {
  GraphAsyncNodeGeneratorAsyncTransform,
  GraphAsyncNodeTupleTransform,
  GraphNodeTupleGeneratorAsyncTransform,
} from './graph-async-node'
import { createDepthFirstSteps } from './directed-acyclic-async'
import type { CreateDepthFirstStepsOptions } from './directed-acyclic'

export function createCommonAncestors<
  Id extends string,
  Metadata
> (directedAcyclicAsync: GraphAsync<Id, Metadata>): GraphNodeTupleGeneratorAsyncTransform<Id, GraphCommonAncestor<Id>> {
  const toNodeDepthFirstSteps = createNodeDepthFirstSteps(directedAcyclicAsync)

  return async function* (a, b) {
    for await (const { path: aPath } of toNodeDepthFirstSteps(a)) {
      for await (const { path: bPath } of toNodeDepthFirstSteps(b)) {
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

export function createAncestor<
  Id extends string,
  Metadata
> (directedAcyclicAsync: GraphAsync<Id, Metadata>): GraphAsyncNodeTupleTransform<Id, boolean> {
  const toNodeDepthFirstSteps = createNodeDepthFirstSteps(directedAcyclicAsync)

  return async function (descendant, ancestor) {
    return await pipe(
      toNodeDepthFirstSteps,
      some<GraphStep<Id, Metadata>>(({ path }) => includes(ancestor)(path) as boolean)
    )(descendant)
  }
}

export function createNodeDepthFirstSteps<
  Id extends string,
  Metadata
> (
  directedAcyclicAsync: GraphAsync<Id, Metadata>,
  options: { createDepthFirstSteps?: CreateDepthFirstStepsOptions<Id, Metadata> } = {}
): GraphAsyncNodeGeneratorAsyncTransform<Id, GraphStep<Id, Metadata>> {
  const toSteps = createDepthFirstSteps<Id, Metadata>(options.createDepthFirstSteps)

  return async function* (node) {
    yield* await pipe(
      toSteps,
      filter(({ path }) => path.at(-1) === node),
    )(directedAcyclicAsync)
  }
}
