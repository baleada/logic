import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { pipe, reduce } from 'lazy-collections'
import type { ToGraphYielded } from '../../src/pipes/createToGraph'
import { createToGraph } from '../../src/pipes/createToGraph'
import type { Graph } from '../../src/extracted'

type TreeNode = {
  node: string,
  children: TreeNode[],
}

const suite = createSuite<{
  tree: TreeNode[],
}>('createToGraph')

suite.before(context => {
  context.tree = [
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
      ],
    },
  ]
})

suite('createToGraph(...) works', ({ tree }) => {
  const value = pipe(
          createToGraph<TreeNode>({
            toId: ({ node }) => node,
          })(tree),
          reduce<Graph<string, unknown>, ToGraphYielded>((graph, { node, edge }) => {
            graph.nodes.push(node)
            // @ts-expect-error
            if (edge) graph.edges.push(edge)

            return graph
          }, { nodes: [], edges: [] }),
        )(tree),
        expected = {
          nodes: [
            'a',
            'b',
            'd',
            'h',
            'e',
            'c',
            'f',
            'g',
          ],
          edges: [
            { from: 'a', to: 'b' },
            { from: 'b', to: 'd' },
            { from: 'd', to: 'h' },
            { from: 'b', to: 'e' },
            { from: 'a', to: 'c' },
            { from: 'c', to: 'f' },
            { from: 'c', to: 'g' },
          ],
        }

  assert.equal(value, expected)
})

suite.run()
