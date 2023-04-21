import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import type { GraphEdge, GraphNode } from '../../src/extracted/graph'
import { createToIncoming, createToIndegree, createToOutdegree, createToOutgoing } from '../../src/pipes/graph'

const suite = createSuite<{
  graph: {
    nodes: GraphNode<any>[],
    edges: GraphEdge<any, number>[],
  }
}>('graph node pipes')

suite.before(context => {
  const nodes = [
    'y',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
  ]

  const edges = [
    { from: 'y', to: 'z', predicateTraversable: state => state.y.metadata === 0 },
    { from: 'a', to: 'b', predicateTraversable: state => state.a.metadata === 0 },
    { from: 'a', to: 'c', predicateTraversable: state => state.a.metadata === 1 },
    { from: 'a', to: 'd', predicateTraversable: state => state.a.metadata === 2 },
    { from: 'b', to: 'd', predicateTraversable: state => state.b.metadata === 0 },
    { from: 'b', to: 'e', predicateTraversable: state => state.b.metadata === 1 },
    { from: 'c', to: 'f', predicateTraversable: state => state.c.metadata === 0 },
    { from: 'c', to: 'g', predicateTraversable: state => state.c.metadata === 1 },
  ]

  context.graph = { nodes, edges }
})

suite('createToIncoming(...) works', ({ graph }) => {
  ;(() => {
    const value = [...createToIncoming(graph)('a')],
          expected = []

    assert.equal(value, expected)
  })()
  
  ;(() => {
    const value = [...createToIncoming(graph)('b')]

    assert.is(value.length, 1)
    for (const { to } of value) {
      assert.is(to, 'b')
    }
  })()
})

suite('createToOutgoing(...) works', ({ graph }) => {
  ;(() => {
    const value = [...createToOutgoing(graph)('a')]
    
    assert.is(value.length, 3)
    for (const { from } of value) {
      assert.is(from, 'a')
    }
  })()
  
  ;(() => {
    const value = [...createToOutgoing(graph)('g')],
          expected = []

    assert.equal(value, expected)
  })()
})

suite('createToIndegree(...) works', ({ graph }) => {
  ;(() => {
    const value = createToIndegree(graph)('a'),
          expected = 0

    assert.is(value, expected)
  })()
  
  ;(() => {
    const value = createToIndegree(graph)('b'),
          expected = 1

    assert.is(value, expected)
  })()
})

suite('createToOutdegree(...) works', ({ graph }) => {
  ;(() => {
    const value = createToOutdegree(graph)('a'),
          expected = 3

    assert.is(value, expected)
  })()
  
  ;(() => {
    const value = createToOutdegree(graph)('g'),
          expected = 0

    assert.is(value, expected)
  })()
})

suite.run()
