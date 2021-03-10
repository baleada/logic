import * as classes from '@src/classes.js'
import * as pipes from '@src/pipes.js'
import * as util from '@src/util.js'

import { createApp, nextTick } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import routes from './pages/routes.js'

import DOMPurify from 'dompurify'

const Logic = {
  ...classes,
  ...pipes,
  ...util,
}

window.Logic = Logic
window.Logic_classes = classes
window.Logic_pipes = pipes
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


console.log((new DOMPurify()).sanitize(`<script>alert('hello');</script><div>hello</div>`))

