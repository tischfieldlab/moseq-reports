import { createApp } from 'vue'
import App from './App.vue'

import './style.css'
import VueResize from "vue3-resize";
//import VueForceNextTick from "vue-force-next-tick";
//import UniqueId from "vue-unique-id";
//import VueTimeago from "vue-timeago";

const app = createApp(App)
app.use(VueResize);
import './demos/ipc'
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
import './demos/node'

