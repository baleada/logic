<template>
  <div ref="element1">
    <div>
      <div>
        <input id="first" type="text">
      </div>
      <input type="text">
    </div>
    <div>
      <input type="text">
      <div>
        <input id="last" type="text">
      </div>
    </div>
  </div>
  <div ref="element2">
    <div><h1>Baleada</h1></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const element1 = ref()
const element2 = ref()

onMounted(() => {
  window.testState = {
    element1,
    element2
  }
})
</script>
