import {remote, ipcRenderer} from 'electron';
if (!(remote.getCurrentWindow() as any).hasReloaded) {
    ipcRenderer.send('needs-reload');
}


import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

import '@/components/Core';


import App from './App.vue';
import router from './router';
import store from './store/root.store';
import './registerServiceWorker';

import {CreateServer, ShutdownServer} from '@/components/Core/DataLoader/DataServer';



// Bootstrap Stuff
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);

import VueResize from 'vue-resize';
Vue.use(VueResize);

import VueForceNextTick from 'vue-force-next-tick';
Vue.use(VueForceNextTick);

import UniqueId from 'vue-unique-id';
Vue.use(UniqueId);

import AsyncComputed from 'vue-async-computed';
Vue.use(AsyncComputed);

Vue.config.productionTip = false;
Vue.config.silent = true;

import {CreateTitleBar} from './WindowChrome';
CreateTitleBar();

import VueTimeago from 'vue-timeago';
Vue.use(VueTimeago, {
    name: 'Timeago',
    locale: 'en',
    autoUpdate: 60,
});



const vm = new Vue({
    router,
    store,
    render: (h) => h(App),
    mounted() {
        if ((remote.getCurrentWindow() as any).hasReloaded) {
            ipcRenderer.send('app-ready');
        }
    },
    beforeDestroy() {
        ShutdownServer();
    }
});

// delay mounting the app until after server is completed startup
CreateServer()
    .catch((reason) => {
        // tslint:disable-next-line:no-console
        console.error('Error creating server', reason);
    })
    .then(() => {
        vm.$mount('#app');
    });

export default vm;
