<template>
  <h1>Fetchable</h1>
</template>

<script>
import { Fetchable } from './TEST_BUNDLE.js'
export default {
  setup () {
    window.Fetchable = Fetchable
  }
}
</script>
