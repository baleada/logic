import * as classes from '../../../../src/classes'
import * as pipes from '../../../../src/pipes'
import * as extracted from '../../../../src/extracted'

console.log(ref);
console.log(Listenable);



import { createApp, nextTick } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import routes from 'virtual:generated-pages'

const Logic = {
  ...classes,
  ...pipes,
  ...extracted,
};

window.Logic = Logic;
window.Logic_classes = classes;
window.Logic_pipes = pipes;
window.Logic_extracted = extracted;

const app = createApp(App),
      history = createWebHistory(),
      router = createRouter({
        history,
        strict: true,
        routes,
      })

app.use(router)
app.mount('#app');

window.nextTick = nextTick
