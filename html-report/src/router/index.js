import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/views/HomePage'
import Data from '@/views/DataPage'
import Options from '@/views/OptionsPage'

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
      name: 'dataview',
      component: Data
    },
    {
      path: '/options',
      name: 'options',
      component: Options
    }
  ]
})
