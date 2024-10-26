<template>
  <div style="margin: 20px; width: 20px; height: 20px;" id="el"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { Listenable } from '../../../../../../src/classes/Listenable';
import { createMousehover, MousehoverType, MousehoverMetadata } from '../../../../../../src/factories/createMousehover';

let listenable: Listenable<MousehoverType, MousehoverMetadata>
onMounted(() => {
  listenable = new Listenable<MousehoverType, MousehoverMetadata>(
    'recognizeable' as MousehoverType, 
    { recognizeable: { effects: createMousehover() } }
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
