import { createRouter, createWebHistory } from 'vue-router'

const history = createWebHistory()

export default createRouter({
  history,
  strict: true,
  routes: [
    { path: '/Logic', component: import('./Logic.stub.vue') }
  ],
})

