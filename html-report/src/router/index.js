import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/views/Home'
import Data from '@/views/Data'
import Options from '@/views/Options'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/data',
      name: 'data',
      component: Data
    },
    {
      path: '/options',
      name: 'options',
      component: Options
    }
  ]
})
