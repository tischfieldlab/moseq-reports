import { createApp, h } from "vue";
import '@render/components/Core';
// @ts-ignore
import App from "@render/App.vue";
import { ipcRenderer } from "electron";
import VueDraggableResizable from 'vue-draggable-resizable'
import VueForceNextTick from "vue-force-next-tick";
import uniqueIdPlugin from '@render/@types/uniqueIdPlugin';
import VueTimeago from "vue3-timeago";
import "@render/events/Listeners";
import {CreateServer, ShutdownServer} from '@render/components/Core/DataLoader/DataServer';
import store from "@render/store/root.store";

import {createBootstrap} from 'bootstrap-vue-next'
//import { IconsPlugin } from 'bootstrap-vue-next'
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';
import { DiscoverDataComponents } from "@render/components/Core";
// Helper Function: Check if App has Reloaded
function hasAppReloadedOnce() {
  return ipcRenderer.sendSync("has-reloaded");
}

// App Initialization
async function initializeApp() {
  try {
    // Start the data server before mounting the app
    await CreateServer();
    console.log("Server created successfully.");
  } catch (error) {
    console.error("Error creating server:", error);
  }
}
// Check if App Needs Reload
if (!hasAppReloadedOnce()) {
  ipcRenderer.send("needs-reload");
} else {
  initializeApp();
}
const app = createApp(App);

app.use(store);

app.use(createBootstrap());
//app.use(IconsPlugin);
app.use(VueDraggableResizable);
app.use(VueForceNextTick);
app.use(uniqueIdPlugin);
app.use(VueTimeago, {
  name: 'Timeago',
  enLocale: "en", 
  autoUpdate: 60, 
});

DiscoverDataComponents(app);


app.mount("#app").$nextTick(() => {

  postMessage({ payload: "removeLoading" }, "*");
});

export default app;
