import Vue from "vue";
import App from "./App.vue";

import Vuex from "vuex";
Vue.use(Vuex);

import { BootstrapVue, BootstrapVueIcons } from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);

const vm = new Vue({
    render: (h) => h(App),
})
    .$mount("#app")
    .$nextTick(window.removeLoading);

export default vm;
