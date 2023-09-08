import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { map, pipe, toArray } from 'lazy-collections'
import type { GraphAsyncEdge, GraphNode, GraphStep } from '../../src/extracted/graph'
import {
  createDepthFirstSteps,
  createTree,
  createLayers,
} from '../../src/pipes/directed-acyclic-async'
import {
  createNodeDepthFirstSteps,
  createAncestor,
  createCommonAncestors,
} from '../../src/pipes/directed-acyclic-async-node'
import {
  createPath,
} from '../../src/pipes/directed-acyclic-async-state'
import { createDepthPathConfig } from '../../src/factories'

const suite = createSuite<{
  depthFirstDirectedAcyclic: {
    nodes: GraphNode<any>[],
    edges: GraphAsyncEdge<any, number>[],
  },
  breadthFirstDirectedAcyclic: {
    nodes: GraphNode<any>[],
    edges: GraphAsyncEdge<any, number>[],
  }
}>('directed acyclic async pipes')

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

  const depthFirstEdges = [
    { from: 'a', to: 'b', predicateShouldTraverse: async state => await debounce(() => state.a.value === 0) },
    { from: 'a', to: 'c', predicateShouldTraverse: async state => await debounce(() => state.a.value === 1) },
    { from: 'a', to: 'd', predicateShouldTraverse: async state => await debounce(() => state.a.value === 2) },
    { from: 'b', to: 'd', predicateShouldTraverse: async state => await debounce(() => state.b.value === 0) },
    { from: 'b', to: 'e', predicateShouldTraverse: async state => await debounce(() => state.b.value === 1) },
    { from: 'c', to: 'f', predicateShouldTraverse: async state => await debounce(() => state.c.value === 0) },
    { from: 'c', to: 'g', predicateShouldTraverse: async state => await debounce(() => state.c.value === 1) },
    { from: 'd', to: 'h', predicateShouldTraverse: async state => await debounce(() => state.d.value === 0) },
  ]

  const breadthFirstEdges = [
    { from: 'a', to: 'b', predicateShouldTraverse: async state => await debounce(() => state.a.value === 0) },
    { from: 'a', to: 'c', predicateShouldTraverse: async state => await debounce(() => state.b.value === 0) },
    { from: 'a', to: 'd', predicateShouldTraverse: async state => await debounce(() => state.c.value === 0) },
    { from: 'b', to: 'e', predicateShouldTraverse: async state => await debounce(() => state.d.value === 0) },
    { from: 'c', to: 'f', predicateShouldTraverse: async state => await debounce(() => state.e.value === 0) },
    { from: 'c', to: 'g', predicateShouldTraverse: async state => await debounce(() => state.f.value === 0) },
    { from: 'd', to: 'h', predicateShouldTraverse: async state => await debounce(() => state.g.value === 0) },
  ]

  context.depthFirstDirectedAcyclic = {
    nodes,
    edges: depthFirstEdges,
  }

  context.breadthFirstDirectedAcyclic = {
    nodes,
    edges: breadthFirstEdges,
  }
})

suite('createPath(...) works', async ({ depthFirstDirectedAcyclic }) => {
  await (async () => {
    const value = await createPath(
            depthFirstDirectedAcyclic,
            createDepthPathConfig(depthFirstDirectedAcyclic),
          )({
            a: { status: 'set', value: 0 },
            b: { status: 'set', value: 0 },
            d: { status: 'set', value: 0 },
          }),
          expected = ['a', 'b', 'd', 'h']

    assert.equal(value, expected)
  })()
  
  await (async () => {
    const value = await createPath(
            depthFirstDirectedAcyclic,
            createDepthPathConfig(depthFirstDirectedAcyclic),
          )({
            a: { status: 'set', value: 1 },
            c: { status: 'set', value: 0 },
          }),
          expected = ['a', 'c', 'f']

    assert.equal(value, expected)
  })()
})

suite('createDepthFirstSteps works', async ({ depthFirstDirectedAcyclic }) => {
  const value = await pipe(
    createDepthFirstSteps(),
    map<GraphStep<any, number>, any>(step => step.path.at(-1)),
    toArray()
  )(depthFirstDirectedAcyclic)

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

suite.skip('createDepthFirstSteps works with multiple roots', async ({ depthFirstDirectedAcyclic }) => {
  const value = await pipe(
    createDepthFirstSteps(),
    map<GraphStep<any, number>, any>(step => step.path.at(-1)),
    toArray()
  )({
    nodes: [...depthFirstDirectedAcyclic.nodes, 'i'],
    edges: [
      ...depthFirstDirectedAcyclic.edges,
      { from: 'i', to: 'c', predicateShouldTraverse: async state => await debounce(() => state.i.value === 0) },
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

suite('createFromNodeDepthFirstSteps works', async ({ depthFirstDirectedAcyclic }) => {
  await (async () => {
    const value = await pipe(
            createNodeDepthFirstSteps(depthFirstDirectedAcyclic),
            toArray()
          )('a'),
          expected = [
            {
              path: ['a'],
              state: {
                a: { status: 'unset' },
                b: { status: 'unset' },
                c: { status: 'unset' },
                d: { status: 'unset' },
                e: { status: 'unset' },
                f: { status: 'unset' },
                g: { status: 'unset' },
                h: { status: 'unset' },
              },
            },
          ]

    assert.equal(value, expected)
  })()

  await (async () => {
    const value = await pipe(
            createNodeDepthFirstSteps(depthFirstDirectedAcyclic),
            toArray(),
          )('g'),
          expected = [
            {
              path: [ 'a', 'c', 'g' ],
              state: {
                a: { status: 'set', value: 1 },
                b: { status: 'unset' },
                c: { status: 'set', value: 1 },
                d: { status: 'unset' },
                e: { status: 'unset' },
                f: { status: 'unset' },
                g: { status: 'unset' },
                h: { status: 'unset' },
              },
            },
          ]
    
    assert.equal(value, expected)
  })()
  
  await (async () => {
    const value = await pipe(
            createNodeDepthFirstSteps(depthFirstDirectedAcyclic),
            toArray(),
          )('d'),
          expected = [
            {
              path: [ 'a', 'b', 'd' ],
              state: {
                a: { status: 'set', value: 0 },
                b: { status: 'set', value: 0 },
                c: { status: 'unset' },
                d: { status: 'unset' },
                e: { status: 'unset' },
                f: { status: 'unset' },
                g: { status: 'unset' },
                h: { status: 'unset' },
              },
            },
            {
              path: [ 'a', 'd' ],
              state: {
                a: { status: 'set', value: 2 },
                b: { status: 'unset' },
                c: { status: 'unset' },
                d: { status: 'unset' },
                e: { status: 'unset' },
                f: { status: 'unset' },
                g: { status: 'unset' },
                h: { status: 'unset' },
              },
            },
          ]
    
    assert.equal(value, expected)
  })()
})

suite('createAncestor works', async ({ depthFirstDirectedAcyclic }) => {
  await (async () => {
    const value = await createAncestor(depthFirstDirectedAcyclic)('d', 'a'),
          expected = true

    assert.equal(value, expected)
  })()
  
  // Handles non-shortest path
  await (async () => {
    const value = await createAncestor(depthFirstDirectedAcyclic)('d', 'b'),
          expected = true

    assert.equal(value, expected)
  })()
  
  await (async () => {
    const value = await createAncestor(depthFirstDirectedAcyclic)('d', 'c'),
          expected = false

    assert.equal(value, expected)
  })()
})

suite('createCommonAncestors works', async ({ depthFirstDirectedAcyclic }) => {
  await (async () => {
    const value = await pipe(
            async () => await createCommonAncestors(depthFirstDirectedAcyclic)('a', 'b'),
            toArray(),
          )(),
          expected = []

    assert.equal(value, expected)
  })()
  
  await (async () => {
    const value = await pipe(
            async () => await createCommonAncestors(depthFirstDirectedAcyclic)('b', 'e'),
            toArray(),
          )(),
          expected = [
            { node: 'a', distances: { b: 1, e: 2 } },
          ]

    assert.equal(value, expected)
  })()
})

suite('createCommonAncestors handles multiple paths from one node to another', async ({ depthFirstDirectedAcyclic }) => {
  const value = await pipe(
          async () => await createCommonAncestors(depthFirstDirectedAcyclic)('d', 'g'),
          toArray(),
        )(),
        expected = [
          { node: 'a', distances: { d: 2, g: 2 } },
          { node: 'a', distances: { d: 1, g: 2 } },
        ]

  assert.equal(value, expected)
})

suite('createCommonAncestors orders ancestors from deepest to shallowest', async ({ depthFirstDirectedAcyclic }) => {
  const value = await pipe(
          async () => await createCommonAncestors(depthFirstDirectedAcyclic)('d', 'e'),
          toArray(),
        )(),
        expected = [
          { node: 'b', distances: { d: 1, e: 1 } },
          { node: 'a', distances: { d: 2, e: 2 } },
          { node: 'a', distances: { d: 1, e: 2 } },
        ]

  assert.equal(value, expected)
})

suite('createTree works', async ({ depthFirstDirectedAcyclic }) => {
  const value = await createTree<string>()(depthFirstDirectedAcyclic),
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

suite('createLayers works', async ({ depthFirstDirectedAcyclic }) => {
  const value = await createLayers()(depthFirstDirectedAcyclic),
        expected = [
          ['a'],
          ['b', 'c', 'd'],
          ['d', 'e', 'f', 'g'],
          ['h'],
        ]

  assert.equal(value, expected)
})

suite.run()
