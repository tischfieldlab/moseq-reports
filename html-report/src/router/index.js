import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/views/HomePage'
import Options from '@/views/OptionsPage'
import Data from '@/views/DataPage'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/options#/',
      name: 'options',
      component: Options
    },
    {
      path: '/data#/',
      name: 'data',
      component: Data
    }
  ]
})
