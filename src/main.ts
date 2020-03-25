import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

import '@/components/data_components/Core';


import App from './App.vue';
import router from './router';
import store from './store/root.store';
import './registerServiceWorker';


// Bootstrap Stuff
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
Vue.use(BootstrapVue);

import VueResize from 'vue-resize';
Vue.use(VueResize);


import UniqueId from 'vue-unique-id';
Vue.use(UniqueId);

Vue.config.productionTip = false;
Vue.config.silent = true;

const vm = new Vue({
    router,
    store,
    render: (h) => h(App),
}).$mount('#app');

export default vm;
