import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { createDecisionTree } from '../../src/factories/graph-fns/createDecisionTree'
import type { DecisionTree } from '../../src/factories/graph-fns/createDecisionTree'
import { GraphEdge, GraphNode } from '../../src/factories/graph-fns/types'

const suite = createSuite<{
  nodes: GraphNode[],
  edges: GraphEdge[],
  decisionTree: DecisionTree<string>,
}>('createDecisionTree')

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

  context.decisionTree = createDecisionTree(
    context.nodes,
    context.edges,
  )
})

suite(`walk prioritizes false branches by default`, ({ decisionTree }) => {
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

suite(`walk optionally prioritizes true branches`, ({ nodes, edges }) => {
  const decisionTree = createDecisionTree(
    nodes,
    edges,
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
