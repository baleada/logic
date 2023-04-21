import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { map, pipe, toArray } from 'lazy-collections'
import type { AsyncGraphEdge, GraphNode, GraphStep } from '../../src/extracted/graph'
import {
  createToPath,
  createToSteps,
  createToNodeSteps,
  createPredicateAncestor,
  createToCommonAncestors,
  createToTree,
} from '../../src/pipes/directed-acyclic-async'

const suite = createSuite<{
  directedAcyclic: {
    nodes: GraphNode<any>[],
    edges: AsyncGraphEdge<any, number>[],
  }
}>('async directed acyclic pipes')

async function debounce<T> (cb: () => T) {
  return await new Promise<T>(resolve => {
    setTimeout(() => resolve(cb()), 0)
  })
} 

suite.before(context => {
  const nodes = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
  ]

  const edges = [
    { from: 'a', to: 'b', predicateTraversable: async state => await debounce(() => state.a.metadata === 0) },
    { from: 'a', to: 'c', predicateTraversable: async state => await debounce(() => state.a.metadata === 1) },
    { from: 'a', to: 'd', predicateTraversable: async state => await debounce(() => state.a.metadata === 2) },
    { from: 'b', to: 'd', predicateTraversable: async state => await debounce(() => state.b.metadata === 0) },
    { from: 'b', to: 'e', predicateTraversable: async state => await debounce(() => state.b.metadata === 1) },
    { from: 'c', to: 'f', predicateTraversable: async state => await debounce(() => state.c.metadata === 0) },
    { from: 'c', to: 'g', predicateTraversable: async state => await debounce(() => state.c.metadata === 1) },
    { from: 'd', to: 'h', predicateTraversable: async state => await debounce(() => state.d.metadata === 0) },
  ]

  context.directedAcyclic = { nodes: nodes, edges: edges }
})

suite('createToPath(...) works', async ({ directedAcyclic }) => {
  await (async () => {
    const value = await createToPath(directedAcyclic)({
            a: { status: 'set', metadata: 0 },
            b: { status: 'set', metadata: 0 },
            d: { status: 'set', metadata: 0 },
          }),
          expected = ['a', 'b', 'd', 'h']

    assert.equal(value, expected)
  })()
  
  await (async () => {
    const value = await createToPath(directedAcyclic)({
            a: { status: 'set', metadata: 1 },
            c: { status: 'set', metadata: 0 },
          }),
          expected = ['a', 'c', 'f']

    assert.equal(value, expected)
  })()
})

suite('createToSteps works', async ({ directedAcyclic }) => {
  const value = await pipe(
    createToSteps(),
    map<GraphStep<any, number>, any>(step => step.path.at(-1)),
    toArray()
  )(directedAcyclic)

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

suite.skip('createToSteps works with multiple roots', async ({ directedAcyclic }) => {
  const value = await pipe(
    createToSteps(),
    map<GraphStep<any, number>, any>(step => step.path.at(-1)),
    toArray()
  )({
    nodes: [...directedAcyclic.nodes, 'i'],
    edges: [
      ...directedAcyclic.edges,
      { from: 'i', to: 'c', predicateTraversable: async state => await debounce(() => state.i.metadata === 0) },
    ],
  })

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
      'i',
      'c',
      'f',
      'g',
      'd',
    ]
  )
})

suite('createFromNodeToSteps works', async ({ directedAcyclic }) => {
  await (async () => {
    const value = await pipe(
            createToNodeSteps(directedAcyclic),
            toArray()
          )('a'),
          expected = [
            {
              path: ['a'],
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
    const value = await pipe(
            createToNodeSteps(directedAcyclic),
            toArray(),
          )('g'),
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
    const value = await pipe(
            createToNodeSteps(directedAcyclic),
            toArray(),
          )('d'),
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

suite('createPredicateAncestor works', async ({ directedAcyclic }) => {
  await (async () => {
    const value = await createPredicateAncestor(directedAcyclic)('d', 'a'),
          expected = true

    assert.equal(value, expected)
  })()
  
  // Handles non-shortest path
  await (async () => {
    const value = await createPredicateAncestor(directedAcyclic)('d', 'b'),
          expected = true

    assert.equal(value, expected)
  })()
  
  await (async () => {
    const value = await createPredicateAncestor(directedAcyclic)('d', 'c'),
          expected = false

    assert.equal(value, expected)
  })()
})

suite('createToCommonAncestors works', async ({ directedAcyclic }) => {
  await (async () => {
    const value = await pipe(
            async () => await createToCommonAncestors(directedAcyclic)('a', 'b'),
            toArray(),
          )(),
          expected = []

    assert.equal(value, expected)
  })()
  
  await (async () => {
    const value = await pipe(
            async () => await createToCommonAncestors(directedAcyclic)('b', 'e'),
            toArray(),
          )(),
          expected = [
            { node: 'a', distances: { b: 1, e: 2 } },
          ]

    assert.equal(value, expected)
  })()
})

suite('createToCommonAncestors handles multiple paths from one node to another', async ({ directedAcyclic }) => {
  const value = await pipe(
          async () => await createToCommonAncestors(directedAcyclic)('d', 'g'),
          toArray(),
        )(),
        expected = [
          { node: 'a', distances: { d: 2, g: 2 } },
          { node: 'a', distances: { d: 1, g: 2 } },
        ]

  assert.equal(value, expected)
})

suite('createToCommonAncestors orders ancestors from deepest to shallowest', async ({ directedAcyclic }) => {
  const value = await pipe(
          async () => await createToCommonAncestors(directedAcyclic)('d', 'e'),
          toArray(),
        )(),
        expected = [
          { node: 'b', distances: { d: 1, e: 1 } },
          { node: 'a', distances: { d: 2, e: 2 } },
          { node: 'a', distances: { d: 1, e: 2 } },
        ]

  assert.equal(value, expected)
})



suite.skip('createToTree works', async ({ directedAcyclic }) => {
  const value = await createToTree<string, number>()(directedAcyclic),
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
