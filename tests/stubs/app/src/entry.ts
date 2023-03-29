import { createApp, nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import routes from 'virtual:generated-pages'
import * as classes from '../../../../src/classes'
import * as pipes from '../../../../src/pipes'
import * as extracted from '../../../../src/extracted'
import * as recognizeableEffects from '../../../../src/factories/recognizeable-effects'
import App from './App.vue'

const Logic = {
  ...classes,
  ...pipes,
  ...extracted,
  ...recognizeableEffects,
}

window.Logic = Logic
window.Logic_classes = classes
window.Logic_pipes = pipes
window.Logic_extracted = extracted

const app = createApp(App),
      history = createWebHistory(),
      router = createRouter({
        history,
        strict: true,
        routes,
      })

app.use(router)
app.mount('#app')

window.nextTick = nextTick
