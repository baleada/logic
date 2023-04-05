<template>
  <WysiwygTree />
</template>

<script setup lang="ts">
import { h, ref, onBeforeUpdate, onMounted, watchPostEffect } from 'vue'
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
  {
    id: '5',
    type: 'p',
  },
  {
    id: '6',
    type: 'text',
    text: 'Hello',
  },
  {
    id: '7',
    type: 'text',
    text: ' ',
  },
  {
    id: '8',
    type: 'text',
    text: 'World',
  },
  {
    id: '9',
    type: 'div',
  }
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
  {
    from: '5',
    to: '6',
    predicateTraversable: state => state['5'].metadata === 0,
  },
  {
    from: '5',
    to: '7',
    predicateTraversable: state => state['5'].metadata === 1,
  },
  {
    from: '5',
    to: '8',
    predicateTraversable: state => state['5'].metadata === 2,
  },
  {
    from: '9',
    to: '1',
    predicateTraversable: state => state['9'].metadata === 0,
  },
  {
    from: '9',
    to: '5',
    predicateTraversable: state => state['9'].metadata === 1,
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

    return node.type === 'text'
      ? [node.text]
      : h(
        node.type,
        { key: node.id, ref: getTreeElementRef(node.id) },
        toVNodes(treeNode.children),
      )
  })
}

const treeElements = ref<HTMLElement[]>([])
const getTreeElementRef = (id: string) => (el: HTMLElement) => {
  const index = nodes
    .filter(node => !('text' in node))
    .findIndex(node => node.id === id)
  treeElements.value[index] = el
}

onBeforeUpdate(() => {
  treeElements.value = []
})

onMounted(() => {
  watchPostEffect(() => {
    for (let i = 0; i < treeElements.value.length; i++) {
      if (
        fns.toIndegree(nodes.filter(node => !('text' in node))[i].id) === 0
      ) {
        continue
      }

      treeElements.value[i].addEventListener('click', event => {
        console.log(event.target)
      })
    }
  })
})
</script>
