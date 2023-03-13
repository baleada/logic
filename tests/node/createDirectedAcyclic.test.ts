import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { createDirectedAcyclic } from '../../src/factories/graph-fns/createDirectedAcyclic'
import type { DirectedAcyclic } from '../../src/factories/graph-fns/createDirectedAcyclic'
import type { GraphEdge, GraphNode } from '../../src/factories/graph-fns/types'

const suite = createSuite<{
  nodes: GraphNode[],
  edges: GraphEdge[],
  directedAcyclic: DirectedAcyclic<string, number>,
}>('createDirectedAcyclic')

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
    { from: 'a', to: 'b', predicateTraversable: state => state.a.metadata === 0 },
    { from: 'a', to: 'c', predicateTraversable: state => state.a.metadata === 1 },
    { from: 'a', to: 'd', predicateTraversable: state => state.a.metadata === 2 },
    { from: 'b', to: 'd', predicateTraversable: state => state.b.metadata === 0 },
    { from: 'b', to: 'e', predicateTraversable: state => state.b.metadata === 1 },
    { from: 'c', to: 'f', predicateTraversable: state => state.c.metadata === 0 },
    { from: 'c', to: 'g', predicateTraversable: state => state.c.metadata === 1 },
  ]

  context.directedAcyclic = createDirectedAcyclic(
    context.nodes,
    context.edges,
    () => 0,
    (node, totalConnectionsFollowed) => totalConnectionsFollowed,
  )
})

suite(`toIncoming(...) works`, ({ directedAcyclic }) => {
  ;(() => {
    const value = directedAcyclic.toIncoming('a'),
          expected = []

    assert.equal(value, expected)
  })()
  
  ;(() => {
    const value = directedAcyclic.toIncoming('b')

    assert.is(value.length, 1)
    for (const { to } of value) {
      assert.is(to, 'b')
    }
  })()
})

suite(`toOutgoing(...) works`, ({ directedAcyclic }) => {
  ;(() => {
    const value = directedAcyclic.toOutgoing('a')
    
    assert.is(value.length, 3)
    for (const { from } of value) {
      assert.is(from, 'a')
    }
  })()
  
  ;(() => {
    const value = directedAcyclic.toOutgoing('g'),
          expected = []

    assert.equal(value, expected)
  })()
})

suite(`toIndegree(...) works`, ({ directedAcyclic }) => {
  ;(() => {
    const value = directedAcyclic.toIndegree('a'),
          expected = 0

    assert.is(value, expected)
  })()
  
  ;(() => {
    const value = directedAcyclic.toIndegree('b'),
          expected = 1

    assert.is(value, expected)
  })()
})

suite(`toOutdegree(...) works`, ({ directedAcyclic }) => {
  ;(() => {
    const value = directedAcyclic.toOutdegree('a'),
          expected = 3

    assert.is(value, expected)
  })()
  
  ;(() => {
    const value = directedAcyclic.toOutdegree('g'),
          expected = 0

    assert.is(value, expected)
  })()
})

suite(`toPath(...) works`, ({ directedAcyclic }) => {
  ;(() => {
    const value = directedAcyclic.toPath({
            a: { status: 'set', metadata: 0 },
            b: { status: 'set', metadata: 0 },
          }),
          expected = ['a', 'b', 'd']

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

suite(`walk works`, ({ directedAcyclic }) => {
  const value = [] as string[]

  directedAcyclic.walk(path => value.push(path.at(-1)))  

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

suite(`toTraversals works`, ({ directedAcyclic }) => {
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
                g: { status: 'unset', metadata: 0 }
              }
            }
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
                g: { status: 'unset', metadata: 0 }
              }
            }
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
                g: { status: 'unset', metadata: 0 }
              }
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
                g: { status: 'unset', metadata: 0 }
              }
            }
          ]
    
    assert.equal(value, expected)
  })()
})

suite(`toSharedAncestors works`, ({ directedAcyclic }) => {
  ;(() => {
    const value = directedAcyclic.toSharedAncestors('a', 'b'),
          expected = []

    assert.equal(value, expected)
  })()
  
  ;(() => {
    const value = directedAcyclic.toSharedAncestors('b', 'e'),
          expected = [
            { node: 'a', distances: { b: 1, e: 2 } }
          ]

    assert.equal(value, expected)
  })()

  ;(() => {
    const value = directedAcyclic.toSharedAncestors('d', 'g'),
          expected = [
            { node: 'a', distances: { d: 2, g: 2 } },
            { node: 'a', distances: { d: 1, g: 2 } }
          ]

    assert.equal(value, expected)
  })
})

suite.run()
