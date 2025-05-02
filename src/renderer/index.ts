import { createApp, h } from "vue";
// @ts-ignore
import App from "@render/App.vue";
import VueDraggableResizable from 'vue-draggable-resizable'
import VueForceNextTick from "vue-force-next-tick";
import uniqueIdPlugin from '@render/@types/uniqueIdPlugin';
import VueTimeago from "vue3-timeago";
//import {CreateServer, ShutdownServer} from '@render/components/Core/DataLoader/DataServer';
import store from "@render/store/root.store";
import {createBootstrap} from 'bootstrap-vue-next'
import Icons  from 'unplugin-icons/vite'
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';
import { DiscoverDataComponents } from "@render/components/Core";
import '@render/commands/windows'
const app = createApp(App);
app.use(store);
app.use(createBootstrap());
//app.use(Icons);
app.use(VueDraggableResizable);
app.use(VueForceNextTick);
app.use(uniqueIdPlugin);
app.use(VueTimeago, {
  name: 'Timeago',
  enLocale: "en", 
  autoUpdate: 60, 
});

app.mount("#app").$nextTick(() => {

  postMessage({ payload: "removeLoading" }, "*");
});
DiscoverDataComponents(app);
export default app;
