<template>
  <div class="p-20">
    <div class="relative flex flex-col gap-36" ref="container">
      <div
        v-for="layer in layers"
        class="flex justify-center gap-6"
        :key="JSON.stringify(layer)"
      >
        <div
          v-for="node in layer"
          class="w-4 h-4 rounded-full bg-slate-600"
          :key="node"
          :id="node"
          ref="elements"
        />
      </div>
    </div>
    <!-- Draw edges -->
    <svg
      class="absolute inset-20"
      :height="containerDimensions.height"
      :width="containerDimensions.width"
      :viewBox="`0 0 ${containerDimensions.width} ${containerDimensions.height}`"
    >
      <path
        v-for="edge in directedAcyclic.edges"
        :key="JSON.stringify(edge)"
        :d="ds[JSON.stringify(edge)]"
        stroke-width="2"
        stroke="currentColor"
        class="text-slate-600"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { createToLayers } from '../../../../../../src/pipes/directed-acyclic'
import { directedAcyclic } from './ast'
import { ref, watchPostEffect, onMounted } from 'vue'

const layers = createToLayers()(directedAcyclic)

const elements = ref([])

const container = ref(null)
const containerDimensions = ref({ width: 0, height: 0 })

onMounted(() => {
  watchPostEffect(() => {
    containerDimensions.value = {
      width: container.value?.clientWidth || 0,
      height: container.value?.clientHeight || 0,
    }
  })
})


const ds = ref({})

onMounted(() => {
  watchPostEffect(() => {
    ds.value = {}
  
    for (const edge of directedAcyclic.edges) {
      const from = elements.value.find(({ id }) => id === edge.from),
            to = elements.value.find(({ id }) => id === edge.to)
  
      ds.value[JSON.stringify(edge)] = `M${from.offsetLeft + from.clientWidth / 2} ${from.offsetTop + from.clientHeight / 2} L${to.offsetLeft + to.clientWidth / 2} ${to.offsetTop + to.clientHeight / 2}`
    }
  })
})

</script>

