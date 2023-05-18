import { createApp, nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import routes from 'virtual:generated-pages'
import * as classes from '../../../../src/classes'
import * as pipes from '../../../../src/pipes'
import * as factories from '../../../../src/factories'
import * as extracted from '../../../../src/extracted'
import App from './App.vue'

const Logic = {
  ...classes,
  ...pipes,
  ...extracted,
  ...factories,
}

window.Logic = Logic

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
