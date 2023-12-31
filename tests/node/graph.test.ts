import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import type { GraphEdge, GraphNode } from '../../src/extracted/graph'
import {
  createChildren,
  createSiblings,
  createRoot,
  createTerminal,
  createOnlyChild,
  createIncoming,
  createIndegree,
  createOutdegree,
  createOutgoing,
  createTotalSiblings,
} from '../../src/pipes/graph-node'

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
    { from: 'y', to: 'z', predicateShouldTraverse: state => state.y.value === 0 },
    { from: 'a', to: 'b', predicateShouldTraverse: state => state.a.value === 0 },
    { from: 'a', to: 'c', predicateShouldTraverse: state => state.a.value === 1 },
    { from: 'a', to: 'd', predicateShouldTraverse: state => state.a.value === 2 },
    { from: 'b', to: 'd', predicateShouldTraverse: state => state.b.value === 0 },
    { from: 'b', to: 'e', predicateShouldTraverse: state => state.b.value === 1 },
    { from: 'c', to: 'f', predicateShouldTraverse: state => state.c.value === 0 },
    { from: 'c', to: 'g', predicateShouldTraverse: state => state.c.value === 1 },
  ]

  context.graph = { nodes, edges }
})

suite('createRoot(...) works', ({ graph }) => {
  {
    const value = createRoot(graph)('a'),
          expected = true

    assert.is(value, expected)
  }
  
  {
    const value = createRoot(graph)('b'),
          expected = false

    assert.is(value, expected)
  }
})

suite('createTerminal(...) works', ({ graph }) => {
  {
    const value = createTerminal(graph)('a'),
          expected = false

    assert.is(value, expected)
  }

  {
    const value = createTerminal(graph)('g'),
          expected = true

    assert.is(value, expected)
  }
})

suite('createChildren(...) works', ({ graph }) => {
  {
    const value = [...createChildren(graph)('a')],
          expected = ['b', 'c', 'd']

    assert.equal(value, expected)
  }
  
  {
    const value = [...createChildren(graph)('b')],
          expected = ['d', 'e']

    assert.equal(value, expected)
  }
})

suite('createIncoming(...) works', ({ graph }) => {
  {
    const value = [...createIncoming(graph)('a')],
          expected = []

    assert.equal(value, expected)
  }
  
  {
    const value = [...createIncoming(graph)('b')]

    assert.is(value.length, 1)
    for (const { to } of value) {
      assert.is(to, 'b')
    }
  }
})

suite('createOutgoing(...) works', ({ graph }) => {
  {
    const value = [...createOutgoing(graph)('a')]
    
    assert.is(value.length, 3)
    for (const { from } of value) {
      assert.is(from, 'a')
    }
  }
  
  {
    const value = [...createOutgoing(graph)('g')],
          expected = []

    assert.equal(value, expected)
  }
})

suite('createIndegree(...) works', ({ graph }) => {
  {
    const value = createIndegree(graph)('a'),
          expected = 0

    assert.is(value, expected)
  }
  
  {
    const value = createIndegree(graph)('b'),
          expected = 1

    assert.is(value, expected)
  }
})

suite('createOutdegree(...) works', ({ graph }) => {
  {
    const value = createOutdegree(graph)('a'),
          expected = 3

    assert.is(value, expected)
  }
  
  {
    const value = createOutdegree(graph)('g'),
          expected = 0

    assert.is(value, expected)
  }
})

suite('createTotalSiblings(...) works', ({ graph }) => {
  {
    const value = createTotalSiblings(graph)('b'),
          expected = 2

    assert.is(value, expected)
  }
  
  {
    const value = createTotalSiblings(graph)('g'),
          expected = 1

    assert.is(value, expected)
  }
})

suite('createOnlyChild(...) works', ({ graph }) => {
  {
    const value = createOnlyChild(graph)('b'),
          expected = false
    
    assert.is(value, expected)
  }

  {
    const value = createOnlyChild(graph)('z'),
          expected = true

    assert.is(value, expected)
  }
})

suite('createSiblings(...) works', ({ graph }) => {
  {
    const value = [...createSiblings(graph)('b')],
          expected = ['c', 'd']

    assert.equal(value, expected)
  }
  
  {
    const value = [...createSiblings(graph)('d')],
          expected = ['b', 'c', 'e']

    assert.equal(value, expected)
  }
})

suite.run()
