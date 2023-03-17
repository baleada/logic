import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { createDirectedAcyclicAsyncFns } from '../../src/factories/graph-fns/createDirectedAcyclicAsyncFns'
import type { DirectedAcyclicFns } from '../../src/factories/graph-fns/createDirectedAcyclicAsyncFns'
import type { GraphEdgeAsync, GraphNode } from '../../src/factories/graph-fns/types'

const suite = createSuite<{
  nodes: GraphNode<any>[],
  edges: GraphEdgeAsync<any, any>[],
  directedAcyclic: DirectedAcyclicFns<string, number>,
}>('createDirectedAcyclicAsyncFns')

suite.before(context => {
  context.nodes = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
  ]

  context.edges = [
    {
      from: 'a', to: 'b',
      predicateTraversable: async state => await new Promise(resolve => {
        setTimeout(() => resolve(state.a.metadata === 0), 0)
      }),
    },
    {
      from: 'a', to: 'c',
      predicateTraversable: async state => await new Promise(resolve => {
        setTimeout(() => resolve(state.a.metadata === 1), 0)
      }),
    },
    {
      from: 'a', to: 'd',
      predicateTraversable: async state => await new Promise(resolve => {
        setTimeout(() => resolve(state.a.metadata === 2), 0)
      }),
    },
    {
      from: 'b', to: 'd',
      predicateTraversable: async state => await new Promise(resolve => {
        setTimeout(() => resolve(state.b.metadata === 0), 0)
      }),
    },
    {
      from: 'b', to: 'e',
      predicateTraversable: async state => await new Promise(resolve => {
        setTimeout(() => resolve(state.b.metadata === 1), 0)
      }),
    },
    {
      from: 'c', to: 'f',
      predicateTraversable: async state => await new Promise(resolve => {
        setTimeout(() => resolve(state.c.metadata === 0), 0)
      }),
    },
    {
      from: 'c', to: 'g',
      predicateTraversable: async state => await new Promise(resolve => {
        setTimeout(() => resolve(state.c.metadata === 1), 0)
      }),
    },
  ]

  context.directedAcyclic = createDirectedAcyclicAsyncFns(
    context.nodes,
    context.edges,
    () => 0,
    (node, totalConnectionsFollowed) => totalConnectionsFollowed,
  )
})

suite(`toPath(...) works`, async ({ directedAcyclic }) => {
  await (async () => {
    const value = await directedAcyclic.toPath({
            a: { status: 'set', metadata: 0 },
            b: { status: 'set', metadata: 0 },
          }),
          expected = ['a', 'b', 'd']

    assert.equal(value, expected)
  })()
  
  await (async () => {
    const value = await directedAcyclic.toPath({
            a: { status: 'set', metadata: 1 },
            c: { status: 'set', metadata: 0 },
          }),
          expected = ['a', 'c', 'f']

    assert.equal(value, expected)
  })()
})

suite(`walk works`, async ({ directedAcyclic }) => {
  const value = [] as string[]

  await directedAcyclic.walk(path => value.push(path.at(-1)))  

  assert.equal(
    value,
    [
      'a',
      'b',
      'd',
      'e',
      'c',
      'f',
      'g',
      'd',
    ]
  )
})

suite(`toTraversals works`, async ({ directedAcyclic }) => {
  await (async () => {
    const value = await directedAcyclic.toTraversals('a'),
          expected = [
            {
              path: [ 'a' ],
              state: {
                a: { status: 'unset', metadata: 0 },
                b: { status: 'unset', metadata: 0 },
                c: { status: 'unset', metadata: 0 },
                d: { status: 'unset', metadata: 0 },
                e: { status: 'unset', metadata: 0 },
                f: { status: 'unset', metadata: 0 },
                g: { status: 'unset', metadata: 0 },
              },
            },
          ]

    assert.equal(value, expected)
  })()

  await (async () => {
    const value = await directedAcyclic.toTraversals('g'),
          expected = [
            {
              path: [ 'a', 'c', 'g' ],
              state: {
                a: { status: 'set', metadata: 1 },
                b: { status: 'unset', metadata: 0 },
                c: { status: 'set', metadata: 1 },
                d: { status: 'unset', metadata: 0 },
                e: { status: 'unset', metadata: 0 },
                f: { status: 'unset', metadata: 0 },
                g: { status: 'unset', metadata: 0 },
              },
            },
          ]
    
    assert.equal(value, expected)
  })()
  
  await (async () => {
    const value = await directedAcyclic.toTraversals('d'),
          expected = [
            {
              path: [ 'a', 'b', 'd' ],
              state: {
                a: { status: 'set', metadata: 0 },
                b: { status: 'set', metadata: 0 },
                c: { status: 'unset', metadata: 0 },
                d: { status: 'unset', metadata: 0 },
                e: { status: 'unset', metadata: 0 },
                f: { status: 'unset', metadata: 0 },
                g: { status: 'unset', metadata: 0 },
              },
            },
            {
              path: [ 'a', 'd' ],
              state: {
                a: { status: 'set', metadata: 2 },
                b: { status: 'unset', metadata: 0 },
                c: { status: 'unset', metadata: 0 },
                d: { status: 'unset', metadata: 0 },
                e: { status: 'unset', metadata: 0 },
                f: { status: 'unset', metadata: 0 },
                g: { status: 'unset', metadata: 0 },
              },
            },
          ]
    
    assert.equal(value, expected)
  })()
})

suite(`toSharedAncestors works`, async ({ directedAcyclic }) => {
  await (async () => {
    const value = await directedAcyclic.toSharedAncestors('a', 'b'),
          expected = []

    assert.equal(value, expected)
  })()
  
  await (async () => {
    const value = await directedAcyclic.toSharedAncestors('b', 'e'),
          expected = [
            { node: 'a', distances: { b: 1, e: 2 } },
          ]

    assert.equal(value, expected)
  })()

  await (async () => {
    const value = await directedAcyclic.toSharedAncestors('d', 'g'),
          expected = [
            { node: 'a', distances: { d: 2, g: 2 } },
            { node: 'a', distances: { d: 1, g: 2 } },
          ]

    assert.equal(value, expected)
  })
})

suite.run()
