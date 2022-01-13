import {remote, ipcRenderer} from 'electron';

function hasAppReloadedOnce() {
    return (remote.getCurrentWindow().webContents as any).hasReloaded;
}
if (!hasAppReloadedOnce()) {
    ipcRenderer.send('needs-reload');
} else {
    // delay mounting the app until after server is completed startup
    CreateServer()
        .catch((reason) => {
            // tslint:disable-next-line:no-console
            console.error('Error creating server', reason);
        })
        .then(() => {
            vm.$mount('#app');
        });
}

import Vue from 'vue';
Vue.config.productionTip = false;
Vue.config.silent = remote.process.env.NODE_ENV === 'production'; // silent while in production

import Vuex from 'vuex';
Vue.use(Vuex);

import '@/components/Core';
import App from './App.vue';
import router from './router';
import store from './store/root.store';
import './registerServiceWorker';
import {CreateServer, ShutdownServer} from '@/components/Core/DataLoader/DataServer';
import {CreateTitleBar} from './WindowChrome';

// Bootstrap Stuff
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue';
import './themes/msq.scss';
// import 'bootstrap/dist/css/bootstrap.css';
// import 'bootstrap-vue/dist/bootstrap-vue.css';
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);

import VueResize from 'vue-resize';
Vue.use(VueResize);

import VueForceNextTick from 'vue-force-next-tick';
Vue.use(VueForceNextTick);

import UniqueId from 'vue-unique-id';
Vue.use(UniqueId);

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
    beforeMount() {
        CreateTitleBar();
    },
    mounted() {
        if (hasAppReloadedOnce()) {
            ipcRenderer.send('app-ready');
        }
    },
    beforeDestroy() {
        ShutdownServer();
    }
});



export default vm;
