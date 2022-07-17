import Vue from "vue";
// @ts-ignore
import App from "./App.vue";
// import './samples/node-api'

const app = new Vue({
  render: (h) => h(App),
});

app.$mount("#app").$nextTick(() => {
  postMessage({ payload: "removeLoading" }, "*");
});
