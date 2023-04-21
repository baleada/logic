import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { createDirectedAcyclicFns } from '../../src/factories/createDirectedAcyclicFns'
import type { DirectedAcyclicFns } from '../../src/factories/createDirectedAcyclicFns'
import type { GraphEdge, GraphNode } from '../../src/extracted/graph'

const suite = createSuite<{
  nodes: GraphNode<any>[],
  edges: GraphEdge<any, any>[],
  directedAcyclic: DirectedAcyclicFns<string, number>,
}>('createDirectedAcyclicFns')

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
    { from: 'a', to: 'b', predicateTraversable: state => state.a.metadata === 0 },
    { from: 'a', to: 'c', predicateTraversable: state => state.a.metadata === 1 },
    { from: 'a', to: 'd', predicateTraversable: state => state.a.metadata === 2 },
    { from: 'b', to: 'd', predicateTraversable: state => state.b.metadata === 0 },
    { from: 'b', to: 'e', predicateTraversable: state => state.b.metadata === 1 },
    { from: 'c', to: 'f', predicateTraversable: state => state.c.metadata === 0 },
    { from: 'c', to: 'g', predicateTraversable: state => state.c.metadata === 1 },
    { from: 'd', to: 'h', predicateTraversable: state => state.d.metadata === 0 },
  ]

  context.directedAcyclic = createDirectedAcyclicFns({
    nodes: context.nodes,
    edges: context.edges,
  })
})

suite('toPath(...) works', ({ directedAcyclic }) => {
  ;(() => {
    const value = directedAcyclic.toPath({
            a: { status: 'set', metadata: 0 },
            b: { status: 'set', metadata: 0 },
            d: { status: 'set', metadata: 0 },
          }),
          expected = ['a', 'b', 'd', 'h']

    assert.equal(value, expected)
  })()
  
  ;(() => {
    const value = directedAcyclic.toPath({
            a: { status: 'set', metadata: 1 },
            c: { status: 'set', metadata: 0 },
          }),
          expected = ['a', 'c', 'f']

    assert.equal(value, expected)
  })()
})

suite('walk works', ({ directedAcyclic }) => {
  const value = [] as string[]

  directedAcyclic.walk(path => value.push(path.at(-1)))  

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

suite('toTraversals works', ({ directedAcyclic }) => {
  ;(() => {
    const value = directedAcyclic.toTraversals('a'),
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

  ;(() => {
    const value = directedAcyclic.toTraversals('g'),
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
    const value = directedAcyclic.toTraversals('d'),
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

suite('createCommonAncestors works', ({ directedAcyclic }) => {
  ;(() => {
    const value = directedAcyclic.createCommonAncestors('a')('b'),
          expected = []

    assert.equal(value, expected)
  })()
  
  ;(() => {
    const value = directedAcyclic.createCommonAncestors('b')('e'),
          expected = [
            { node: 'a', distances: { b: 1, e: 2 } },
          ]

    assert.equal(value, expected)
  })()

  // Handles multiple paths from one node to another
  ;(() => {
    const value = directedAcyclic.createCommonAncestors('d')('g'),
          expected = [
            { node: 'a', distances: { d: 2, g: 2 } },
            { node: 'a', distances: { d: 1, g: 2 } },
          ]

    assert.equal(value, expected)
  })()
  
  // Ancestors are ordered from deepest to shallowest
  ;(() => {
    const value = directedAcyclic.createCommonAncestors('d')('e'),
          expected = [
            { node: 'b', distances: { d: 1, e: 1 } },
            { node: 'a', distances: { d: 2, e: 2 } },
            { node: 'a', distances: { d: 1, e: 2 } },
          ]

    assert.equal(value, expected)
  })()
})

suite('createPredicateAncestor works', ({ directedAcyclic }) => {
  ;(() => {
    const value = directedAcyclic.createPredicateAncestor('d')('a'),
          expected = true

    assert.equal(value, expected)
  })()
  
  // Handles non-shortest path
  ;(() => {
    const value = directedAcyclic.createPredicateAncestor('d')('b'),
          expected = true

    assert.equal(value, expected)
  })()
  
  ;(() => {
    const value = directedAcyclic.createPredicateAncestor('d')('c'),
          expected = false

    assert.equal(value, expected)
  })()
})

suite('toTree works', ({ directedAcyclic }) => {
  const value = directedAcyclic.toTree(),
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
