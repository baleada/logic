import { find, some } from 'lazy-collections'
import { createFindAsync, createMapAsync } from '../pipes'
import type { Expand } from '../extracted'
import type {
  GraphAsync,
  GraphVertex,
  GraphEdgeAsync,
  GraphState,
  GraphTraversal,
  GraphCommonAncestor,
  GraphTreeNode,
} from '../extracted'
import type { GraphFns } from './createGraphFns'
import { createGraphFns } from './createGraphFns'
import { defaultOptions } from './createDirectedAcyclicFns'
import type { CreateDirectedAcyclicFnsOptions } from './createDirectedAcyclicFns'

export type CreateDirectedAcyclicAsyncFnsOptions<Id extends string, Metadata> = CreateDirectedAcyclicFnsOptions<Id, Metadata>

export type DirectedAcyclicAsyncFns<
  Id extends string,
  Metadata
  > = Expand<GraphFns<Id, Metadata, GraphEdgeAsync<Id, Metadata>> & {
    toTree: (options?: { entry?: Id }) => Promise<GraphTreeNode<Id>[]>,
  createCommonAncestors: (a: GraphVertex<Id>) => Promise<(b: GraphVertex<Id>) => Promise<GraphCommonAncestor<Id>[]>>,
  createPredicateAncestor: (node: GraphVertex<Id>) => Promise<(ancestor: GraphVertex<Id>) => boolean>,
  toTraversals: (node: GraphVertex<Id>) => Promise<GraphTraversal<Id, Metadata>[]>,
  walk: (
    stepEffect: (
      path: GraphVertex<Id>[],
      state: GraphState<Id, Metadata>,
      stop: () => void,
    ) => void,
    options?: { entry?: Id },
  ) => Promise<void>,
  toPath: (state: GraphState<Id, Metadata>) => Promise<GraphVertex<Id>[]>,
  toIndegree: (id: Id) => number,
  toOutdegree: (id: Id) => number,
  toIncoming: (id: Id) => GraphEdgeAsync<Id, Metadata>[],
  toOutgoing: (id: Id) => GraphEdgeAsync<Id, Metadata>[],
}>

export function createDirectedAcyclicAsyncFns<
  Id extends string,
  Metadata
> (
  graph: GraphAsync<Id, Metadata>,
  options: CreateDirectedAcyclicAsyncFnsOptions<Id, Metadata> = {},
): DirectedAcyclicAsyncFns<Id, Metadata> {
  const { nodes, edges } = graph,
        { toUnsetMetadata, toMockMetadata, kind } = { ...defaultOptions, ...options },
        unsetState = {} as GraphState<Id, Metadata>

  for (const node of nodes) {
    unsetState[node] = {
      status: 'unset',
      metadata: toUnsetMetadata(node),
    }
  }

  const toTree: DirectedAcyclicAsyncFns<Id, Metadata>['toTree'] = async (options = {}) => {
    const { entry } = options,
          tree: GraphTreeNode<Id>[] = [
            {
              node: entry || toEntry(),
              children: [],
            },
          ],
          createFindInTree = (node: GraphVertex<Id>) => {
            return (tree: GraphTreeNode<Id>[]) => {
              for (const treeNode of tree) {
                if (treeNode.node === node) return treeNode

                const found = createFindInTree(node)(treeNode.children)
                if (found) return found
              }
            }
          }

    await walk(path => {
      const node = path.at(-1),
            parent = path.at(-2)

      if (parent) {
        const parentTreeNode = createFindInTree(parent)(tree)
        // console.log({ parentTreeNode })
        if (parentTreeNode) {
          parentTreeNode.children.push({
            node,
            children: [],
          })
        }
      }
    })

    return tree
  }

  const createCommonAncestors: DirectedAcyclicAsyncFns<Id, Metadata>['createCommonAncestors'] = async a => {
    const aTraversals = await toTraversals(a)

    return async b => {
      const bTraversals = await toTraversals(b),
            commonAncestors: GraphCommonAncestor<Id>[] = []

      for (const { path: aPath } of aTraversals) {
        for (const { path: bPath } of bTraversals) {
          for (let aPathIndex = aPath.length - 1; aPathIndex >= 0; aPathIndex--) {
            for (let bPathIndex = bPath.length - 1; bPathIndex >= 0; bPathIndex--) {
              if (
                aPath[aPathIndex] === bPath[bPathIndex]
                && ![a, b].includes(aPath[aPathIndex])
              ) {
                commonAncestors.push({
                  node: aPath[aPathIndex],
                  distances: {
                    [a]: aPath.length - aPathIndex - 1,
                    [b]: bPath.length - bPathIndex - 1,
                  },
                } as GraphCommonAncestor<Id>)
              }
            }
          }
        }
      }

      return commonAncestors
    }
  }

  const createPredicateAncestor: DirectedAcyclicAsyncFns<Id, Metadata>['createPredicateAncestor'] = async descendant => {
    const traversals = await toTraversals(descendant),
          paths = createMapAsync<GraphTraversal<Id, Metadata>, Id[]>(
            async traversal => await toPath(traversal.state)
          )(traversals)

    return ancestor => some<Id[]>(path => path.includes(ancestor))(paths) as boolean
  }

  const toTraversals: DirectedAcyclicAsyncFns<Id, Metadata>['toTraversals'] = async node => {
    const traversals: GraphTraversal<Id, Metadata>[] = []
    
    await walk((path, state, stop) => {
      if (path.at(-1) === node) {
        traversals.push({
          path,
          state,
        })

        if (kind === 'arborescence') stop()
      }
    })

    return traversals
  }

  const walk: DirectedAcyclicAsyncFns<Id, Metadata>['walk'] = async (stepEffect, options = {}) => {
    const { entry } = options,
          state: GraphState<Id, Metadata> = JSON.parse(JSON.stringify(unsetState)),
          stop = () => {
            status = 'stopped'
          },
          totalConnectionsFollowedByNode = {} as Record<GraphVertex<Id>, number>
  
    let location = entry
      || find<GraphVertex<Id>>(node => toIndegree(node) === 0)(nodes) as GraphVertex<Id>
    let status: 'walking' | 'stopped' = 'walking'

    const path = await toPath(unsetState)

    stepEffect(
      path,
      JSON.parse(JSON.stringify(unsetState)),
      stop,
    )
  
    async function step () {
      if (status === 'stopped') return

      const isExhausted = totalConnectionsFollowedByNode[location] === toOutdegree(location)

      if (isExhausted) {
        if (toIndegree(location) === 0) return

        state[location].status = 'unset'
        state[location].metadata = toUnsetMetadata(location)

        const path = await toPath(state)
        location = path.at(-2)

        await step()
        return
      }
      
      if (!(location in totalConnectionsFollowedByNode)) totalConnectionsFollowedByNode[location] = 0

      state[location].status = 'set'
      state[location].metadata = toMockMetadata(location, totalConnectionsFollowedByNode[location])
      
      const path = await toPath(state)

      stepEffect(
        path,
        JSON.parse(JSON.stringify(state)),
        stop
      )

      totalConnectionsFollowedByNode[location]++

      const newLocation = path.at(-1)

      if (toOutdegree(newLocation) > 0) location = newLocation

      await step()
    }
  
    await step()
  }

  const toPath: DirectedAcyclicAsyncFns<Id, Metadata>['toPath'] = async state => {
    const path = [
            find<GraphVertex<Id>>(
              node => toIndegree(node) === 0
            )(nodes) as GraphVertex<Id>,
          ],
          getLastOutdegree = () => toOutdegree(path.at(-1)),
          getLastStatus = () => state[path.at(-1)].status
  
    while (getLastOutdegree() > 0 && getLastStatus() === 'set') {
      const outgoing = toOutgoing(path.at(-1)),
            edge = await createFindAsync<GraphEdgeAsync<Id, Metadata>>(
              async ({ predicateTraversable }) => await predicateTraversable(state)
            )(outgoing)
  
      path.push(edge.to)
    }
  
    return path
  }

  const {
    toIndegree,
    toOutdegree,
    toIncoming: toIncomingSync,
    toOutgoing: toOutgoingSync,
    toEntry,
  } = createGraphFns(nodes, edges)

  const toIncoming = toIncomingSync as unknown as (id: Id) => GraphEdgeAsync<Id, Metadata>[]
  const toOutgoing = toOutgoingSync as unknown as (id: Id) => GraphEdgeAsync<Id, Metadata>[]

  return {
    toTree,
    createCommonAncestors,
    createPredicateAncestor,
    toTraversals,
    walk,
    toPath,
    toIndegree,
    toOutdegree,
    toIncoming,
    toOutgoing,
    toEntry,
  }
}
