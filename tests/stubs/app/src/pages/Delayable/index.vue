<template>
  <pre><code>{{ time }}</code></pre>
  <pre><code>{{ progress }}</code></pre>
  <pre><code>{{ executions }}</code></pre>
  <div style="display: flex; gap: 1rem; padding: 4rem;">
    <button @click="delay">delay</button>
    <button @click="pause">pause</button>
    <button @click="resume">resume</button>
    <button @click="stop">stop</button>
    <button @click="seek">seek</button>
  </div>
</template>

<script lang="ts">
import { ref, reactive, computed, defineComponent } from 'vue'
import { Delayable } from '../../../../../../src/classes/Delayable'

export default defineComponent({
  setup () {
    window.testState = { value: 0 }
    
    window.testState.instance = reactive(new Delayable(
      () => {
        window.testState.value++
        console.log(window.testState)
      },
      { delay: 1000 }
    ))

    function delay () {
      window.testState.instance.delay()
    }
    function pause () {
      window.testState.instance.pause()
    }
    function resume () {
      window.testState.instance.resume()
    }
    function stop () {
      window.testState.instance.stop()
    }
    function seek () {
      window.testState.instance.seek(.25)
    }

    return {
      delay,
      pause,
      resume,
      stop,
      seek,
      time: computed(() => toJson(window.testState.instance.time)),
      progress: computed(() => toJson(window.testState.instance.progress)),
      executions: computed(() => window.testState.instance.executions),
    }
  }
})

function toJson (data) {
  return JSON.stringify(data, null, 2)
}
</script>
