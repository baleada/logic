import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { map, pipe, toArray } from 'lazy-collections'
import type { GraphEdge, GraphNode, GraphStep } from '../../src/extracted/graph'
import { createDepthFirstSteps } from '../../src/pipes/decision-tree'

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
    { from: 'a', to: 'b', predicateShouldTraverse: state => state.a.value === false },
    { from: 'a', to: 'c', predicateShouldTraverse: state => state.a.value === true },
    { from: 'b', to: 'd', predicateShouldTraverse: state => state.b.value === false },
    { from: 'b', to: 'e', predicateShouldTraverse: state => state.b.value === true },
    { from: 'c', to: 'f', predicateShouldTraverse: state => state.c.value === false },
    { from: 'c', to: 'g', predicateShouldTraverse: state => state.c.value === true },
  ]

  context.decisionTree = { nodes, edges }
})

suite('createDepthFirstSteps prioritizes false branches by default', ({ decisionTree }) => {
  const value = pipe(
    createDepthFirstSteps(),
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

suite('createDepthFirstSteps optionally prioritizes true branches', ({ decisionTree }) => {
  const value = pipe(
    createDepthFirstSteps({ priorityBranch: true }),
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
