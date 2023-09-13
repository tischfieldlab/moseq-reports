import { createApp, h } from "vue";

// @ts-ignore
import App from "@render/App.vue";

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


const app = createApp(App);

app.use(store);

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
