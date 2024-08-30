<template>
  <div style="margin: 20px; width: 20px; height: 20px;" id="el"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { Listenable } from '../../../../../../src/classes/Listenable';
import { createHover, HoverType, HoverMetadata } from '../../../../../../src/factories/createHover';

let listenable: Listenable<HoverType, HoverMetadata>
onMounted(() => {
  listenable = new Listenable<HoverType, HoverMetadata>(
    'recognizeable' as HoverType, 
    { recognizeable: { effects: createHover() } }
  )

  window.testState = {
    listenable: listenable.listen(
      () => {
        console.log(listenable.recognizeable.metadata)
      },
      { target: document.getElementById('el') }
    )
  }
})

onBeforeUnmount(() => {
  listenable.stop()
})

</script>
