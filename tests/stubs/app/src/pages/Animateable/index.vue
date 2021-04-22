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

<script>
import { ref } from 'vue'
import { Animateable } from '@src/classes'
import { easingsNetInOutBack } from '@baleada/animateable-utils'

export default {
  setup () {
    const keyframes = [
          // Translate
          { 
            progress: 0.75,
            data: {
              translate: 0,
            },
            // timing: easingsNetInOutBack,
          },
          { 
            progress: 1,
            data: {
              translate: 150,
            },
          },
          // Background color and textContent
          { 
            progress: 0,
            data: {
              backgroundColor: 'red',
              textContent: [],
            },
            // timing: easingsNetInOutBack,
          },
          { 
            progress: .5,
            data: {
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

    function frameHandle (frame) {
      const { data: { translate, backgroundColor, textContent } } = frame
      stub.value.style.transform = `translateX(${translate}%`
      stub.value.style.backgroundColor = backgroundColor
      // stub.value.textContent = textContent.join('')
    }
    function play () {
      instance.play(frameHandle)
    }
    function reverse () {
      instance.reverse(frameHandle)
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
      instance.seek(1.25, { handle: frameHandle })
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
}
</script>
