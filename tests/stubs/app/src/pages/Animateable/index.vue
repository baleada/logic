<template>
  <div style="display: flex; gap: 1rem; padding: 4rem;">
    <button @click="play">play</button>
    <button @click="reverse">reverse</button>
    <button @click="setPlaybackRate">setPlaybackRate</button>
    <button @click="pause">pause</button>
    <button @click="restart">restart</button>
    <button @click="stop">stop</button>
    <button @click="seek">seek</button>
  </div>
  <div
    role="img"
    ref="stub"
    style="height: 100px; width: 100px; border: 2px solid slate; border-radius: 4px;"
  />
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'
import { AnimateFrame, Animateable, easingsNetInOutBack } from '../../../../../../src/classes'

export default defineComponent({
  setup () {
    const keyframes = [
          // Translate
          { 
            progress: 0.75,
            properties: {
              translate: 0,
            },
            // timing: easingsNetInOutBack,
          },
          { 
            progress: 1,
            properties: {
              translate: 150,
            },
          },
          // Background color and textContent
          { 
            progress: 0,
            properties: {
              backgroundColor: 'red',
              textContent: [],
            },
            // timing: easingsNetInOutBack,
          },
          { 
            progress: .5,
            properties: {
              backgroundColor: 'blue',
              textContent: 'baleada'.split(''),
            },
          },
        ],
        instance = new Animateable(
          keyframes,
          {
            duration: 3000,
            iterations: 1,
          }
        )

    window.instance = instance

    const stub = ref(null)

    function frameEffect (frame: AnimateFrame) {
      const { properties: { translate, backgroundColor, textContent } } = frame
      stub.value.style.transform = `translateX(${translate.interpolated}%`
      stub.value.style.backgroundColor = backgroundColor.interpolated
      // stub.value.textContent = textContent.join('')
    }
    function play () {
      instance.play(frameEffect)
    }
    function reverse () {
      instance.reverse(frameEffect)
    }
    function setPlaybackRate () {
      instance.setPlaybackRate(4)
    }
    function pause () {
      instance.pause()
    }
    function restart () {
      instance.restart()
    }
    function stop () {
      instance.stop()
    }
    function seek () {
      instance.seek(1.25, { effect: frameEffect })
    }

    return {
      play,
      reverse,
      setPlaybackRate,
      pause,
      restart,
      stop,
      seek,
      stub
    }
  }
})
</script>
