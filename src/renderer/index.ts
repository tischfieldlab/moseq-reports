import "@render/commands"
import { createApp } from "vue";
import App from "@render/App.vue";
import VueForceNextTick from "vue-force-next-tick";
import uniqueIdPlugin from '@render/@types/uniqueIdPlugin';
import timeago from "vue-timeago3";
import { enUS } from 'date-fns/locale';
import { createBootstrap } from 'bootstrap-vue-next'
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';
import { DiscoverDataComponents } from "@render/components/Core";
import { createPinia } from 'pinia'
import { ToastPlugin } from "./util/Toasts";
import { D3AxisDirective } from "@render/components/Charts/D3Axis";
import { ipcRenderer } from "electron";


const pinia = createPinia()
const app = createApp(App);
app.use(pinia);
app.use(createBootstrap());
app.use(ToastPlugin);
app.use(D3AxisDirective);
app.use(VueForceNextTick);
app.use(uniqueIdPlugin);
app.use(timeago, {
    name: 'Timeago',
    locale: enUS,
});

const app_root = app.mount("#app");
app_root.$nextTick(() => {
    postMessage({ payload: "removeLoading" }, "*");
    ipcRenderer.send('app-ready');
});
DiscoverDataComponents(app);



export default app;
export {app_root}
