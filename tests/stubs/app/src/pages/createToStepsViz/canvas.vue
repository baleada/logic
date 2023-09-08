<template>
  <canvas width="800" height="800" ref="canvas" />
</template>

<script setup lang="ts">
import { createDepthFirstSteps } from '../../../../../../src/pipes/directed-acyclic'
import { directedAcyclic } from './ast'
import { ref, onMounted } from 'vue'

const canvas = ref(null)

onMounted(() => {
  const ctx = canvas.value.getContext('2d')

  // Lay out nodes in a circle
  let index = 0
  const coordinates = {}
  for (const { path } of createDepthFirstSteps()(directedAcyclic)) {
    const node = path.at(-1)

    const goldenRatio = 1.61803398875

    coordinates[node] = {
      x: 400 + 350 * Math.cos(index * 2 * Math.PI / directedAcyclic.nodes.length - (Math.PI / 2)),
      y: 400 + 350 * Math.sin(index * 2 * Math.PI / directedAcyclic.nodes.length - (Math.PI / 2)),
    }

    ctx.beginPath()
    ctx.arc(
      coordinates[node].x,
      coordinates[node].y,
      9,
      0,
      2 * Math.PI
    )
    ctx.fillStyle = colors[types.findIndex(type => node.startsWith(type))]
    ctx.fill()
    ctx.closePath()

    index++
  }

  for (const { from, to } of directedAcyclic.edges) {
    // Draw line from `from` to `to`
    ctx.beginPath()
    ctx.moveTo(coordinates[from].x, coordinates[from].y)
    ctx.lineTo(coordinates[to].x, coordinates[to].y)

    const startingColor = colors[types.findIndex(type => from.startsWith(type))]
    const endingColor = colors[types.findIndex(type => to.startsWith(type))]
    const gradient = ctx.createLinearGradient(coordinates[from].x, coordinates[from].y, coordinates[to].x, coordinates[to].y)
    gradient.addColorStop(0, startingColor)
    gradient.addColorStop(1, endingColor)
    ctx.strokeStyle = gradient
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.closePath()
  }
})

const types = Array.from(new Set(directedAcyclic.nodes.map(id => id.split('-')[0])))
const colors = [
  '#fb7185',
  '#fb923c',
  '#facc15',
  '#a3e635',
  '#2dd4bf',
  '#38bdf8',
  '#818cf8',
  '#c084fc',
]
</script>
