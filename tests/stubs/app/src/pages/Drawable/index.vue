<template>
  <svg
    @pointerdown="pointerDownEffect"
    @pointermove="pointerMoveEffect"
    style="touch-action: none;"
  >
    <path
      v-show="path"
      :d="path"
      fill="slate"
    />
  </svg>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { Drawable } from '../../../../../../src/classes/Drawable'

const points = ref([]),
      drawable = ref(new Drawable([])),
      path = computed(() => drawable.value
        .draw(points.value, {
          size: 16,
          thinning: 0.5,
          smoothing: 0.5,
          streamline: 0.5,
        })
        .path
      )

function pointerDownEffect (e: PointerEvent) {
  points.value = [[e.pageX, e.pageY, e.pressure]]
}

function pointerMoveEffect (e: PointerEvent) {
  if (e.buttons === 1) {
    points.value.push([e.pageX, e.pageY, e.pressure])
  }
}
</script>
