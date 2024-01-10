<template>
  <div ref="element7"></div>
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
  <div>
    <div>
      <div ref="element3">
        <input type="text" id="next-descendant">
      </div>
      <div ref="element4"></div>
    </div>
  </div>
  <input type="text" id="next-distant-sibling">
  <input type="text" id="previous-distant-sibling">
  <div>
    <div>
      <div ref="element5"></div>
    </div>
  </div>
  <div ref="element6"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const element1 = ref()
const element2 = ref()
const element3 = ref()
const element4 = ref()
const element5 = ref()
const element6 = ref()
const element7 = ref()

onMounted(() => {
  window.testState = {
    element1,
    element2,
    element3,
    element4,
    element5,
    element6,
    element7,
  }
})
</script>
