import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { createDirectedAcyclicAsyncFns } from '../../src/factories/createDirectedAcyclicAsyncFns'
import type { DirectedAcyclicAsyncFns } from '../../src/factories/createDirectedAcyclicAsyncFns'
import type { GraphEdgeAsync, GraphVertex } from '../../src/extracted/graph'

const suite = createSuite<{
  nodes: GraphVertex<any>[],
  edges: GraphEdgeAsync<any, any>[],
  directedAcyclic: DirectedAcyclicAsyncFns<string, number>,
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
    'h',
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
    {
      from: 'd', to: 'h',
      predicateTraversable: async state => await new Promise(resolve => {
        setTimeout(() => resolve(state.d.metadata === 0), 0)
      }),
    },
  ]

  context.directedAcyclic = createDirectedAcyclicAsyncFns({
    nodes: context.nodes,
    edges: context.edges,
  })
})

suite('toPath(...) works', async ({ directedAcyclic }) => {
  await (async () => {
    const value = await directedAcyclic.toPath({
            a: { status: 'set', metadata: 0 },
            b: { status: 'set', metadata: 0 },
            d: { status: 'set', metadata: 0 },
          }),
          expected = ['a', 'b', 'd', 'h']

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

suite('walk works', async ({ directedAcyclic }) => {
  const value = [] as string[]

  await directedAcyclic.walk(path => value.push(path.at(-1)))  

  assert.equal(
    value,
    [
      'a',
      'b',
      'd',
      'h',
      'e',
      'c',
      'f',
      'g',
      'd',
    ]
  )
})

suite('toTraversals works', async ({ directedAcyclic }) => {
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
                h: { status: 'unset', metadata: 0 },
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
                h: { status: 'unset', metadata: 0 },
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
                h: { status: 'unset', metadata: 0 },
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
                h: { status: 'unset', metadata: 0 },
              },
            },
          ]
    
    assert.equal(value, expected)
  })()
})

suite('createCommonAncestors works', async ({ directedAcyclic }) => {
  await (async () => {
    const value = await (await directedAcyclic.createCommonAncestors('a'))('b'),
          expected = []

    assert.equal(value, expected)
  })()
  
  await (async () => {
    const value = await (await directedAcyclic.createCommonAncestors('b'))('e'),
          expected = [
            { node: 'a', distances: { b: 1, e: 2 } },
          ]

    assert.equal(value, expected)
  })()

  await (async () => {
    const value = await (await directedAcyclic.createCommonAncestors('d'))('g'),
          expected = [
            { node: 'a', distances: { d: 2, g: 2 } },
            { node: 'a', distances: { d: 1, g: 2 } },
          ]

    assert.equal(value, expected)
  })
})

suite('createPredicateAncestor works', async ({ directedAcyclic }) => {
  await (async () => {
    const value = await (await directedAcyclic.createPredicateAncestor('d'))('a'),
          expected = true

    assert.equal(value, expected)
  })()
  
  // Handles non-shortest path
  await (async () => {
    const value = await (await directedAcyclic.createPredicateAncestor('d'))('b'),
          expected = true

    assert.equal(value, expected)
  })()
  
  await (async () => {
    const value = await (await directedAcyclic.createPredicateAncestor('d'))('c'),
          expected = false

    assert.equal(value, expected)
  })()
})

suite('toTree works', async ({ directedAcyclic }) => {
  const value = await directedAcyclic.toTree(),
        expected = [
          {
            node: 'a',
            children: [
              {
                node: 'b',
                children: [
                  {
                    node: 'd',
                    children: [
                      {
                        node: 'h',
                        children: [],
                      },
                    ],
                  },
                  {
                    node: 'e',
                    children: [],
                  },
                ],
              },
              {
                node: 'c',
                children: [
                  {
                    node: 'f',
                    children: [],
                  },
                  {
                    node: 'g',
                    children: [],
                  },
                ],
              },
              {
                node: 'd',
                children: [],
              },
            ],
          },
        ]

  assert.equal(value, expected)
})

suite.run()

