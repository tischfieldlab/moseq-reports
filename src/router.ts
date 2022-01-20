import Vue from 'vue';
import Router from 'vue-router';
import HomePage from '@/views/HomePage.vue';

Vue.use(Router);

export default new Router({
  routes: [
      {
        path: '/',
        name: 'home',
        component: HomePage,
      },
  ],
});
