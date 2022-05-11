import Vue from "vue";
import App from "./App.vue";

import Vuex from "vuex";
Vue.use(Vuex);

import { BootstrapVue, BootstrapVueIcons } from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);

import VueResize from "vue-resize";
import "vue-resize/dist/vue-resize.css";
Vue.use(VueResize as any);

import VueForceNextTick from "vue-force-next-tick";
Vue.use(VueForceNextTick as any);

import UniqueId from "vue-unique-id";
Vue.use(UniqueId);

import VueTimeago from "vue-timeago";
Vue.use(VueTimeago as any, {
    name: "Timeago",
    locale: "en",
    autoUpdate: 60,
});

import store from "./store/root.store";
import { ipcRenderer } from "electron";
import LoadData from "./commands/LoadData";
import { MenuEvents } from "../../core/events/Events";

const vm: any = new Vue({
    store: store,
    render: (h) => h(App),
})
    .$mount("#app")
    .$nextTick(window.removeLoading);

ipcRenderer.on(MenuEvents.LOAD_DATA, () => {
    LoadData();
});

export default vm;
