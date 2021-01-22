import * as Logic from '@src/index.js'
import * as classes from '@src/classes'
import * as factories from '@src/factories'
import * as util from '@src/util'

import { createApp, nextTick } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import routes from './pages/routes.js'

window.Logic = Logic
window.Logic_classes = classes
window.Logic_factories = factories
window.Logic_util = util

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
