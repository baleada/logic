import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { map, pipe, toArray } from 'lazy-collections'
import type { GraphEdge, GraphNode, GraphStep } from '../../src/extracted/graph'
import { createToSteps } from '../../src/pipes/decision-tree'

const suite = createSuite<{
  decisionTree: {
    nodes: GraphNode<any>[],
    edges: GraphEdge<any, number>[],
  }
}>('decision tree pipes')

suite.before(context => {
  const nodes = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
  ]

  const edges = [
    { from: 'a', to: 'b', predicateTraversable: state => state.a.metadata === false },
    { from: 'a', to: 'c', predicateTraversable: state => state.a.metadata === true },
    { from: 'b', to: 'd', predicateTraversable: state => state.b.metadata === false },
    { from: 'b', to: 'e', predicateTraversable: state => state.b.metadata === true },
    { from: 'c', to: 'f', predicateTraversable: state => state.c.metadata === false },
    { from: 'c', to: 'g', predicateTraversable: state => state.c.metadata === true },
  ]

  context.decisionTree = { nodes, edges }
})

suite('createToSteps prioritizes false branches by default', ({ decisionTree }) => {
  const value = pipe(
    createToSteps(),
    map<GraphStep<any, number>, any>(step => step.path.at(-1)),
    toArray()
  )(decisionTree)
  
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

suite('createToSteps optionally prioritizes true branches', ({ decisionTree }) => {
  const value = pipe(
    createToSteps({ priorityBranch: true }),
    map<GraphStep<any, number>, any>(step => step.path.at(-1)),
    toArray()
  )(decisionTree)
  
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
