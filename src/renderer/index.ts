import { createApp, h } from "vue";
// @ts-ignore
import App, { IToastProvider } from "@render/App.vue";
//import VueDraggableResizable from 'vue-draggable-resizable'
import VueForceNextTick from "vue-force-next-tick";
import uniqueIdPlugin from '@render/@types/uniqueIdPlugin';
import timeago from "vue-timeago3";
import {enUS} from 'date-fns/locale';
//import {CreateServer, ShutdownServer} from '@render/components/Core/DataLoader/DataServer';
import {createBootstrap} from 'bootstrap-vue-next'
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';
import { DiscoverDataComponents } from "@render/components/Core";
import { createPinia } from 'pinia'
import { ToastPlugin } from "./util/Toasts";
import { D3AxisDirective } from "@render/components/Charts/D3Axis";


const pinia = createPinia()
const app = createApp(App);
app.use(pinia);
app.use(createBootstrap());
app.use(ToastPlugin);
app.use(D3AxisDirective);
//app.use(VueDraggableResizable);
//console.log("VueDraggableResizable", VueDraggableResizable);
app.use(VueForceNextTick);
app.use(uniqueIdPlugin);
app.use(timeago, {
    name: 'Timeago',
    locale: enUS,
});

const app_root = await app.mount("#app");
app_root.$nextTick(() => {
    postMessage({ payload: "removeLoading" }, "*");
});
DiscoverDataComponents(app);

export default app;
export {app_root}
