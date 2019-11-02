import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';

import DataModel from './DataModel';

// Bootstrap Stuff
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
Vue.use(BootstrapVue);

import VueResize from 'vue-resize';
Vue.use(VueResize);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
  data: {
    dataModel: DataModel,
  },
}).$mount('#app');
