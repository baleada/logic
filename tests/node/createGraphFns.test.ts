import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { createGraphFns } from '../../src/factories/graph-fns/createGraphFns'
import type { GraphFns } from '../../src/factories/graph-fns/createGraphFns'
import type { GraphEdge, GraphNode } from '../../src/factories/graph-fns/types'

const suite = createSuite<{
  nodes: GraphNode<any>[],
  edges: GraphEdge<any, any>[],
  graphFns: GraphFns<string, number, any>,
}>('createGraphFns')

suite.before(context => {
  context.nodes = [
    'y',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
  ]

  context.edges = [
    { from: 'y', to: 'z', predicateTraversable: state => state.y.metadata === 0 },
    { from: 'a', to: 'b', predicateTraversable: state => state.a.metadata === 0 },
    { from: 'a', to: 'c', predicateTraversable: state => state.a.metadata === 1 },
    { from: 'a', to: 'd', predicateTraversable: state => state.a.metadata === 2 },
    { from: 'b', to: 'd', predicateTraversable: state => state.b.metadata === 0 },
    { from: 'b', to: 'e', predicateTraversable: state => state.b.metadata === 1 },
    { from: 'c', to: 'f', predicateTraversable: state => state.c.metadata === 0 },
    { from: 'c', to: 'g', predicateTraversable: state => state.c.metadata === 1 },
  ]

  context.graphFns = createGraphFns(
    context.nodes,
    context.edges,
  )
})

suite('toIncoming(...) works', ({ graphFns }) => {
  ;(() => {
    const value = graphFns.toIncoming('a'),
          expected = []

    assert.equal(value, expected)
  })()
  
  ;(() => {
    const value = graphFns.toIncoming('b')

    assert.is(value.length, 1)
    for (const { to } of value) {
      assert.is(to, 'b')
    }
  })()
})

suite('toOutgoing(...) works', ({ graphFns }) => {
  ;(() => {
    const value = graphFns.toOutgoing('a')
    
    assert.is(value.length, 3)
    for (const { from } of value) {
      assert.is(from, 'a')
    }
  })()
  
  ;(() => {
    const value = graphFns.toOutgoing('g'),
          expected = []

    assert.equal(value, expected)
  })()
})

suite('toIndegree(...) works', ({ graphFns }) => {
  ;(() => {
    const value = graphFns.toIndegree('a'),
          expected = 0

    assert.is(value, expected)
  })()
  
  ;(() => {
    const value = graphFns.toIndegree('b'),
          expected = 1

    assert.is(value, expected)
  })()
})

suite('toOutdegree(...) works', ({ graphFns }) => {
  ;(() => {
    const value = graphFns.toOutdegree('a'),
          expected = 3

    assert.is(value, expected)
  })()
  
  ;(() => {
    const value = graphFns.toOutdegree('g'),
          expected = 0

    assert.is(value, expected)
  })()
})

suite('toEntry(...) works', ({ graphFns }) => {
  ;(() => {
    const value = graphFns.toEntry(),
          expected = 'y'

    assert.is(value, expected)
  })()

  ;(() => {
    const value = graphFns.toEntry({ begin: 1 }),
          expected = 'a'

    assert.is(value, expected)
  })()
})

suite.run()
