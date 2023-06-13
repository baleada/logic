<template>
  
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { Listenable } from '../../../../../../src/classes/Listenable';
import { createMousepress, MousepressType, MousepressMetadata } from '../../../../../../src/factories/createMousepress';

let listenable: Listenable<MousepressType, MousepressMetadata>
onMounted(() => {
  listenable = new Listenable<MousepressType, MousepressMetadata>(
    'recognizeable' as MousepressType, 
    { recognizeable: { effects: createMousepress({ minDistance: 101 }) } }
  )

  window.testState = { listenable: listenable.listen(() => {
    console.log(listenable.recognizeable.metadata)
  }) }
})

onBeforeUnmount(() => {
  listenable.stop()
})

</script>
