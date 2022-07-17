import { createApp } from "vue";
// @ts-ignore
import App from "./App.vue";
// import './samples/node-api'

createApp(App)
  .mount("#app")
  .$nextTick(() => {
    postMessage({ payload: "removeLoading" }, "*");
  });
