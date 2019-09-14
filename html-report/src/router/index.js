import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/views/HomePage'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    }
  ]
})
