<template>
  <svg
    @pointerdown="pointerDownEffect"
    @pointermove="pointerMoveEffect"
    style="touch-action: none;"
  >
    <path
      v-show="d"
      :d="d"
      fill="slate"
    />
  </svg>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { Drawable, toFlattenedD } from '../../../../../../src/classes/Drawable'

const points = ref([]),
      drawable = ref(
        new Drawable([], {
          toD: toFlattenedD
        })
      ),
      d = computed(() => drawable.value
        .draw(points.value, {
          size: 10,
          thinning: 0.5,
          smoothing: 0.5,
          streamline: 0.5,
        })
        .d
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
