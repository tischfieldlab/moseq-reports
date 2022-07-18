import Vue from "vue";

// @ts-ignore
import App from "@render/App.vue";

import Vuex from "vuex";
import VueResize from "vue-resize";
import VueForceNextTick from "vue-force-next-tick";
import UniqueId from "vue-unique-id";
import VueTimeago from "vue-timeago";
import "@render/events/Listeners";
import { CreateTitleBar } from "./core/ChromeWindow";
import store from "@render/store/root.store";

import { BootstrapVue, IconsPlugin } from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

Vue.use(Vuex);
Vue.config.devtools = true;

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);
Vue.use(VueResize);
Vue.use(VueForceNextTick);
Vue.use(UniqueId);
Vue.use(VueTimeago, {
  name: "Timeago",
  locale: "en",
  autoUpdate: 60,
});

const app = new Vue({
  store,
  render: (h) => h(App),
  beforeMount() {
    CreateTitleBar();
  },
});

app.$mount("#app").$nextTick(() => {
  postMessage({ payload: "removeLoading" }, "*");
});
