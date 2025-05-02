import { ipcRenderer } from "electron";
import store from "../store/root.store";
import { ComponentRegistration } from "../store/root.types";
import { watch } from "vue"; 

console.log("✅ windows.ts loaded");

// Return all available component registrations
export function AvailableComponents(): ComponentRegistration[] {
  console.log("Available components caled")
  return [...store.state.registry];
}

// Trigger creation of component
export function CreateComponent(component: ComponentRegistration) {
  store.dispatch("datawindows/createWindow", component);
}

watch(
  () => store.state.registry.length,
  (newLength) => {
    if (newLength > 0) {
      const components = AvailableComponents();
      const safeData = JSON.parse(JSON.stringify(components));
      console.log("✅ Registry is ready (sanitized):", safeData);
      ipcRenderer.send("available-components-response", safeData);
    }
  },
  { immediate: true }
);


// Handle create-component
ipcRenderer.on("create-component", (_event, component: ComponentRegistration) => {
  CreateComponent(component);
});
