import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

import '@/components/data_components/Core';


import App from './App.vue';
import router from './router';
import store from './store/root.store';
import './registerServiceWorker';

import DataModel from './models/DataModel';





// Bootstrap Stuff
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
Vue.use(BootstrapVue);

import VueResize from 'vue-resize';
Vue.use(VueResize);

Vue.config.productionTip = false;
Vue.config.silent = true;

new Vue({
    router,
    store,
    render: (h) => h(App),
    data: {
        dataModel: DataModel,
    },
}).$mount('#app');
