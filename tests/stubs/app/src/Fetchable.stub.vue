<template>
  <h1>Fetchable</h1>
</template>

<script>
import { Fetchable } from './testable'
export default {
  setup () {
    window.Fetchable = Fetchable
  }
}
</script>
