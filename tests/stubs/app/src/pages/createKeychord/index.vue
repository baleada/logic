<template>
  
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { Listenable } from '../../../../../../src/classes/Listenable';
import { createKeychord, KeychordType, KeychordMetadata } from '../../../../../../src/factories/createKeychord';

let listenable: Listenable<KeychordType, KeychordMetadata>
onMounted(() => {
  listenable = new Listenable<KeychordType, KeychordMetadata>(
    'recognizeable' as KeychordType, 
    { recognizeable: { effects: createKeychord('alt+a alt+s alt+d alt+f') } }
  )

  window.testState = { listenable: listenable.listen(() => {
    console.log(listenable.recognizeable.metadata)
  }) }
})

onBeforeUnmount(() => {
  listenable.stop()
})

</script>
