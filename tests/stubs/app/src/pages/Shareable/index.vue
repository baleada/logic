<template>
  <button @click="() => shareable.share()">Share</button>
</template>

<script setup lang="ts">
import { Shareable } from '../../../../../../src/classes/Shareable'

const shareable = new Shareable({title: document.title, text: window.location.href, url: window.location.href})
// @ts-expect-error
window.testState = { shareable }
</script>
