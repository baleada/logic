import * as classes from '../../../../src/classes'
import * as pipes from '../../../../src/pipes'
import * as extracted from '../../../../src/extracted'
import { WithGlobals } from '../../../fixtures/types'

import { createApp, nextTick } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import routes from 'virtual:generated-pages'

const Logic = {
  ...classes,
  ...pipes,
  ...extracted,
};

(window as unknown as WithGlobals).Logic = Logic;
(window as unknown as WithGlobals).Logic_classes = classes;
(window as unknown as WithGlobals).Logic_pipes = pipes;
(window as unknown as WithGlobals).Logic_extracted = extracted;

const app = createApp(App),
      history = createWebHistory(),
      router = createRouter({
        history,
        strict: true,
        routes,
      })

app.use(router)
app.mount('#app');

(window as unknown as WithGlobals).nextTick = nextTick
