<template>
  
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { Listenable } from '../../../../../../src/classes/Listenable';
import { createKeypress, KeypressType, KeypressMetadata } from '../../../../../../src/factories/createKeypress';

let listenable: Listenable<KeypressType, KeypressMetadata>
onMounted(() => {
  listenable = new Listenable<KeypressType, KeypressMetadata>(
    'recognizeable' as KeypressType, 
    { recognizeable: { effects: createKeypress([',', 'shift+a', 'shift+opt+a']) } }
  )

  window.testState = { listenable: listenable.listen(() => {
    console.log(listenable.recognizeable.metadata)
  }) }
})

onBeforeUnmount(() => {
  listenable.stop()
})

</script>
