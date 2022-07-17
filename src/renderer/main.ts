import Vue from "vue";
// @ts-ignore
import App from "./App.vue";
// import './samples/node-api'

import { BootstrapVue, IconsPlugin } from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);

const app = new Vue({
  render: (h) => h(App),
});

app.$mount("#app").$nextTick(() => {
  postMessage({ payload: "removeLoading" }, "*");
});
