import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { map, pipe, toArray } from 'lazy-collections'
import type { GraphEdge, GraphNode, GraphStep } from '../../src/extracted/graph'
import {
  createRoots,
  createDepthFirstSteps,
  createTree,
  createLayers,
} from '../../src/pipes/directed-acyclic'
import {
  createNodeDepthFirstSteps,
  createAncestor,
  createCommonAncestors,
} from '../../src/pipes/directed-acyclic-node'
import { createPath } from '../../src/pipes/directed-acyclic-state'
import { createDepthPathConfig } from '../../src/factories/createDepthPathConfig'
// import { createBreadthPathConfig } from '../../src/factories/createBreadthPathConfig'

const suite = createSuite<{
  depthFirstDirectedAcyclic: {
    nodes: GraphNode<any>[],
    edges: GraphEdge<any, number>[],
  },
  breadthFirstDirectedAcyclic: {
    nodes: GraphNode<any>[],
    edges: GraphEdge<any, number>[],
  }
}>('directed acyclic pipes')

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
    { from: 'a', to: 'b', predicateShouldTraverse: state => state.a.value === 0 },
    { from: 'a', to: 'c', predicateShouldTraverse: state => state.a.value === 1 },
    { from: 'a', to: 'd', predicateShouldTraverse: state => state.a.value === 2 },
    { from: 'b', to: 'd', predicateShouldTraverse: state => state.b.value === 0 },
    { from: 'b', to: 'e', predicateShouldTraverse: state => state.b.value === 1 },
    { from: 'c', to: 'f', predicateShouldTraverse: state => state.c.value === 0 },
    { from: 'c', to: 'g', predicateShouldTraverse: state => state.c.value === 1 },
    { from: 'd', to: 'h', predicateShouldTraverse: state => state.d.value === 0 },
  ]

  // TODO: figure this out and apply to async
  const breadthFirstEdges = [
    { from: 'a', to: 'b', predicateShouldTraverse: state => state.a.value === 0 },
    { from: 'a', to: 'c', predicateShouldTraverse: state => state.b.value === 0 },
    { from: 'a', to: 'd', predicateShouldTraverse: state => state.c.value === 0 },
    { from: 'b', to: 'e', predicateShouldTraverse: state => state.d.value === 0 },
    { from: 'c', to: 'f', predicateShouldTraverse: state => state.e.value === 0 },
    { from: 'c', to: 'g', predicateShouldTraverse: state => state.f.value === 0 },
    { from: 'd', to: 'h', predicateShouldTraverse: state => state.g.value === 0 },
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

suite('createRoots(...) works', ({ depthFirstDirectedAcyclic }) => {
  const withMoreRoots = {
    nodes: [
      ...depthFirstDirectedAcyclic.nodes,
      'i',
    ],
    edges: [
      ...depthFirstDirectedAcyclic.edges,
      { from: 'i', to: 'c', predicateShouldTraverse: state => state.i.value === 0 },
    ],
  }

  {
    const value = [...createRoots()(withMoreRoots)],
          expected = ['a', 'i']

    assert.equal(value, expected)
  }
})

suite('createPath(...) works', ({ depthFirstDirectedAcyclic }) => {
  {
    const value = createPath(
            depthFirstDirectedAcyclic,
            createDepthPathConfig(depthFirstDirectedAcyclic)
          )({
            a: { status: 'set', value: 0 },
            b: { status: 'set', value: 0 },
            d: { status: 'set', value: 0 },
          }),
          expected = ['a', 'b', 'd', 'h']

    assert.equal(value, expected)
  }
  
  {
    const value = createPath(
            depthFirstDirectedAcyclic,
            createDepthPathConfig(depthFirstDirectedAcyclic)
          )({
            a: { status: 'set', value: 1 },
            c: { status: 'set', value: 0 },
          }),
          expected = ['a', 'c', 'f']

    assert.equal(value, expected)
  }
  
  // {
  //   const value = createPath(
  //           breadthFirstDirectedAcyclic,
  //           createBreadthPathConfig(breadthFirstDirectedAcyclic)
  //         )({
  //           a: { status: 'set', value: 0 },
  //           b: { status: 'set', value: 0 },
  //           c: { status: 'set', value: 0 },
  //         }),
  //         expected = ['a', 'b', 'c', 'd']

  //   assert.equal(value, expected)
  // }
  
  // {
  //   const value = createPath(
  //           breadthFirstDirectedAcyclic,
  //           createBreadthPathConfig(breadthFirstDirectedAcyclic)
  //         )({
  //           a: { status: 'set', value: 1 },
  //           c: { status: 'set', value: 0 },
  //         }),
  //         expected = ['a', 'c', 'f']

  //   assert.equal(value, expected)
  // }
})

suite('createDepthFirstSteps works', ({ depthFirstDirectedAcyclic }) => {
  const value = pipe(
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

suite.skip('createDepthFirstSteps works with multiple roots', ({ depthFirstDirectedAcyclic }) => {
  const value = pipe(
    createDepthFirstSteps(),
    map<GraphStep<any, number>, any>(step => step.path.at(-1)),
    toArray()
  )({
    nodes: [...depthFirstDirectedAcyclic.nodes, 'i'],
    edges: [
      ...depthFirstDirectedAcyclic.edges,
      { from: 'i', to: 'c', predicateShouldTraverse: state => state.i.value === 0 },
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

suite('createFromNodeDepthFirstSteps works', ({ depthFirstDirectedAcyclic }) => {
  {
    const value = [...createNodeDepthFirstSteps(depthFirstDirectedAcyclic)('a')],
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
  }

  {
    const value = [...createNodeDepthFirstSteps(depthFirstDirectedAcyclic)('g')],
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
  }
  
  {
    const value = [...createNodeDepthFirstSteps(depthFirstDirectedAcyclic)('d')],
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
  }
})

suite('createAncestor works', ({ depthFirstDirectedAcyclic }) => {
  {
    const value = createAncestor(depthFirstDirectedAcyclic)('d', 'a'),
          expected = true

    assert.equal(value, expected)
  }
  
  // Handles non-shortest path
  {
    const value = createAncestor(depthFirstDirectedAcyclic)('d', 'b'),
          expected = true

    assert.equal(value, expected)
  }
  
  {
    const value = createAncestor(depthFirstDirectedAcyclic)('d', 'c'),
          expected = false

    assert.equal(value, expected)
  }
})

suite('createCommonAncestors works', ({ depthFirstDirectedAcyclic }) => {
  {
    const value = [...createCommonAncestors(depthFirstDirectedAcyclic)('a', 'b')],
          expected = []

    assert.equal(value, expected)
  }
  
  {
    const value = [...createCommonAncestors(depthFirstDirectedAcyclic)('b', 'e')],
          expected = [
            { node: 'a', distances: { b: 1, e: 2 } },
          ]

    assert.equal(value, expected)
  }
})

suite('createCommonAncestors handles multiple paths from one node to another', ({ depthFirstDirectedAcyclic }) => {
  const value = [...createCommonAncestors(depthFirstDirectedAcyclic)('d', 'g')],
        expected = [
          { node: 'a', distances: { d: 2, g: 2 } },
          { node: 'a', distances: { d: 1, g: 2 } },
        ]

  assert.equal(value, expected)
})

suite('createCommonAncestors orders ancestors from deepest to shallowest', ({ depthFirstDirectedAcyclic }) => {
  const value = [...createCommonAncestors(depthFirstDirectedAcyclic)('d', 'e')],
        expected = [
          { node: 'b', distances: { d: 1, e: 1 } },
          { node: 'a', distances: { d: 2, e: 2 } },
          { node: 'a', distances: { d: 1, e: 2 } },
        ]

  assert.equal(value, expected)
})

suite('createTree works', ({ depthFirstDirectedAcyclic }) => {
  const value = createTree()(depthFirstDirectedAcyclic),
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

suite('createLayers works', ({ depthFirstDirectedAcyclic }) => {
  const value = [...createLayers()(depthFirstDirectedAcyclic)],
        expected = [
          ['a'],
          ['b', 'c', 'd'],
          ['d', 'e', 'f', 'g'],
          ['h'],
        ]

  assert.equal(value, expected)
})

suite.run()
