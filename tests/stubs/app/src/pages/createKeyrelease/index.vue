<template>
  
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { Listenable } from '../../../../../../src/classes/Listenable';
import { createKeyrelease, KeyreleaseType, KeyreleaseMetadata } from '../../../../../../src/factories/recognizeable-effects/createKeyrelease';

let listenable: Listenable<KeyreleaseType, KeyreleaseMetadata>

onMounted(() => {
  listenable = new Listenable<KeyreleaseType, KeyreleaseMetadata>(
    'recognizeable' as KeyreleaseType, 
    { recognizeable: { effects: createKeyrelease(['A', 'B']) } }
  )

  window.testState = { listenable: listenable.listen(() => {
    console.log(listenable.recognizeable.metadata)
  }) }
})

onBeforeUnmount(() => {
  listenable.stop()
})

</script>
