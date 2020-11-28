import { createRouter, createWebHistory } from 'vue-router'

const history = createWebHistory()

export default createRouter({
  history,
  strict: true,
  routes: [
    { path: '/Fetchable', component: import('./Fetchable.stub.vue') }
  ],
})

