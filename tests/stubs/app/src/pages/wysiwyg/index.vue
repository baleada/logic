<template>
  <WysiwygTree />
</template>

<script setup lang="ts">
import { h } from 'vue'
import { createDirectedAcyclicFns, GraphTreeNode } from '../../../../../../src/factories/graph-fns';

const nodes = [
  {
    id: '1',
    type: 'p',
  },
  {
    id: '2',
    type: 'text',
    text: 'Hello',
    style: ['code', 'strong', 'em'],
  },
  {
    id: '3',
    type: 'text',
    text: ' ',
    style: ['code', 'strong'],
  },
  {
    id: '4',
    type: 'text',
    text: 'World',
    style: ['em'],
  },
]

const edges = [
  {
    from: '1',
    to: '2',
    predicateTraversable: state => state['1'].metadata === 0,
  },
  {
    from: '1',
    to: '3',
    predicateTraversable: state => state['1'].metadata === 1,
  },
  {
    from: '1',
    to: '4',
    predicateTraversable: state => state['1'].metadata === 2,
  },
]

const fns = createDirectedAcyclicFns(
  nodes.map(({ id }) => `${id}`),
  edges,
  () => 0,
  (node, totalConnectionsFollowed) => totalConnectionsFollowed,
)

function WysiwygTree () {
  return toVNodes(fns.toTree())
}

function toVNodes (tree: GraphTreeNode<string>[]) {
  return tree.map(treeNode => {
    const node = nodes.find(({ id }) => id === treeNode.node)

    return h(
      node.type,
      { key: node.id },
      node.type === 'text'
        ? [node.text]
        : toVNodes(treeNode.children),
    )
  })
}

</script>
