import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { map, pipe, toArray } from 'lazy-collections'
import type { GraphEdge, GraphNode, GraphStep } from '../../src/extracted/graph'
import {
  createToNodeSteps,
  createPredicateAncestor,
  createToCommonAncestors,
  createToPath,
  createToRoots,
  createToSteps,
  createToTree,
} from '../../src/pipes/directed-acyclic'

const suite = createSuite<{
  directedAcyclic: {
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

  const edges = [
    { from: 'a', to: 'b', predicateTraversable: state => state.a.metadata === 0 },
    { from: 'a', to: 'c', predicateTraversable: state => state.a.metadata === 1 },
    { from: 'a', to: 'd', predicateTraversable: state => state.a.metadata === 2 },
    { from: 'b', to: 'd', predicateTraversable: state => state.b.metadata === 0 },
    { from: 'b', to: 'e', predicateTraversable: state => state.b.metadata === 1 },
    { from: 'c', to: 'f', predicateTraversable: state => state.c.metadata === 0 },
    { from: 'c', to: 'g', predicateTraversable: state => state.c.metadata === 1 },
    { from: 'd', to: 'h', predicateTraversable: state => state.d.metadata === 0 },
  ]

  context.directedAcyclic = { nodes: nodes, edges: edges }
})

suite('createToRoots(...) works', ({ directedAcyclic }) => {
  const withMoreRoots = {
    nodes: [
      ...directedAcyclic.nodes,
      'i',
    ],
    edges: [
      ...directedAcyclic.edges,
      { from: 'i', to: 'c', predicateTraversable: state => state.i.metadata === 0 },
    ],
  }

  ;(() => {
    const value = [...createToRoots()(withMoreRoots)],
          expected = ['a', 'i']

    assert.equal(value, expected)
  })()
})

suite('createToPath(...) works', ({ directedAcyclic }) => {
  ;(() => {
    const value = createToPath(directedAcyclic)({
            a: { status: 'set', metadata: 0 },
            b: { status: 'set', metadata: 0 },
            d: { status: 'set', metadata: 0 },
          }),
          expected = ['a', 'b', 'd', 'h']

    assert.equal(value, expected)
  })()
  
  ;(() => {
    const value = createToPath(directedAcyclic)({
            a: { status: 'set', metadata: 1 },
            c: { status: 'set', metadata: 0 },
          }),
          expected = ['a', 'c', 'f']

    assert.equal(value, expected)
  })()
})

suite('createToSteps works', ({ directedAcyclic }) => {
  const value = pipe(
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

suite.skip('createToSteps works with multiple roots', ({ directedAcyclic }) => {
  const value = pipe(
    createToSteps(),
    map<GraphStep<any, number>, any>(step => step.path.at(-1)),
    toArray()
  )({
    nodes: [...directedAcyclic.nodes, 'i'],
    edges: [
      ...directedAcyclic.edges,
      { from: 'i', to: 'c', predicateTraversable: state => state.i.metadata === 0 },
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

suite('createFromNodeToSteps works', ({ directedAcyclic }) => {
  ;(() => {
    const value = [...createToNodeSteps(directedAcyclic)('a')],
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

  ;(() => {
    const value = [...createToNodeSteps(directedAcyclic)('g')],
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
  
  ;(() => {
    const value = [...createToNodeSteps(directedAcyclic)('d')],
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

suite('createPredicateAncestor works', ({ directedAcyclic }) => {
  ;(() => {
    const value = createPredicateAncestor(directedAcyclic)(['d', 'a']),
          expected = true

    assert.equal(value, expected)
  })()
  
  // Handles non-shortest path
  ;(() => {
    const value = createPredicateAncestor(directedAcyclic)(['d', 'b']),
          expected = true

    assert.equal(value, expected)
  })()
  
  ;(() => {
    const value = createPredicateAncestor(directedAcyclic)(['d', 'c']),
          expected = false

    assert.equal(value, expected)
  })()
})

suite('createToCommonAncestors works', ({ directedAcyclic }) => {
  ;(() => {
    const value = [...createToCommonAncestors(directedAcyclic)(['a', 'b'])],
          expected = []

    assert.equal(value, expected)
  })()
  
  ;(() => {
    const value = [...createToCommonAncestors(directedAcyclic)(['b', 'e'])],
          expected = [
            { node: 'a', distances: { b: 1, e: 2 } },
          ]

    assert.equal(value, expected)
  })()
})

suite('createToCommonAncestors handles multiple paths from one node to another', ({ directedAcyclic }) => {
  const value = [...createToCommonAncestors(directedAcyclic)(['d', 'g'])],
        expected = [
          { node: 'a', distances: { d: 2, g: 2 } },
          { node: 'a', distances: { d: 1, g: 2 } },
        ]

  assert.equal(value, expected)
})

suite('createToCommonAncestors orders ancestors from deepest to shallowest', ({ directedAcyclic }) => {
  const value = [...createToCommonAncestors(directedAcyclic)(['d', 'e'])],
        expected = [
          { node: 'b', distances: { d: 1, e: 1 } },
          { node: 'a', distances: { d: 2, e: 2 } },
          { node: 'a', distances: { d: 1, e: 2 } },
        ]

  assert.equal(value, expected)
})



suite('createToTree works', ({ directedAcyclic }) => {
  const value = createToTree()(directedAcyclic),
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
