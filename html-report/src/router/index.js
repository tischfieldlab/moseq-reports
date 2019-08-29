import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/components/Home'
import Data from '@/components/Data'
import Options from '@/components/Options'

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
