import Vue from "vue";

// @ts-ignore
import App from "@render/App.vue";

// @ts-ignore
import VueResize from "vue-resize";
import { VueForceNextTick } from "vue-force-next-tick";
import { BootstrapVue, IconsPlugin } from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);
Vue.use(VueResize);
Vue.use(VueForceNextTick);

const app = new Vue({
  render: (h) => h(App),
});

app.$mount("#app").$nextTick(() => {
  postMessage({ payload: "removeLoading" }, "*");
});
