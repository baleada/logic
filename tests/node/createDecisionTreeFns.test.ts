import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { createDecisionTreeFns } from '../../src/factories/createDecisionTreeFns'
import type { DecisionTreeFns } from '../../src/factories/createDecisionTreeFns'
import type { GraphEdge, GraphVertex } from '../../src/extracted/graph'

const suite = createSuite<{
  nodes: GraphVertex<any>[],
  edges: GraphEdge<any, any>[],
  decisionTree: DecisionTreeFns<string>,
}>('createDecisionTreeFns')

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
    { from: 'a', to: 'b', predicateTraversable: state => state.a.metadata === false },
    { from: 'a', to: 'c', predicateTraversable: state => state.a.metadata === true },
    { from: 'b', to: 'd', predicateTraversable: state => state.b.metadata === false },
    { from: 'b', to: 'e', predicateTraversable: state => state.b.metadata === true },
    { from: 'c', to: 'f', predicateTraversable: state => state.c.metadata === false },
    { from: 'c', to: 'g', predicateTraversable: state => state.c.metadata === true },
  ]

  context.decisionTree = createDecisionTreeFns({
    nodes: context.nodes,
    edges: context.edges,
  })
})

suite('walk prioritizes false branches by default', ({ decisionTree }) => {
  const value = [] as string[]

  decisionTree.walk(path => value.push(path.at(-1)))
  
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
    ]
  )
})

suite('walk optionally prioritizes true branches', ({ nodes, edges }) => {
  const decisionTree = createDecisionTreeFns(
    { nodes, edges },
    { walkPriority: true }
  )

  const value = [] as string[]

  decisionTree.walk(path => value.push(path.at(-1)))
  
  assert.equal(
    value,
    [
      'a',
      'c',
      'g',
      'f',
      'b',
      'e',
      'd',
    ]
  )
})

suite.run()
