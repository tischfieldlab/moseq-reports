import { createApp } from "vue";

// @ts-ignore
import App from "@render/App.vue";

import Vuex from "vuex";
import store from "@render/store/root.store"
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

console.log("in renderer");

const app = createApp(App, {
  store,
  beforeMount() {
    CreateTitleBar();
  },
  render: (h) => h(App),
});

app.use(store);
app.config.devtools = true;

app.use(BootstrapVue);
app.use(IconsPlugin);
app.use(VueResize);
app.use(VueForceNextTick);
app.use(UniqueId);
app.use(VueTimeago, {
  name: "Timeago",
  locale: "en",
  autoUpdate: 60,
});

app.mount("#app").$nextTick(() => {
  postMessage({ payload: "removeLoading" }, "*");
});

export default app;
