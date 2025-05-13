import { ipcRenderer } from "electron";
import { watch } from "vue"; 

import {componentRegistry, ComponentRegistration} from '@store/component_registry.store'
import {useWindowsStore} from '@store/windows.store'



console.log("✅ windows.ts loaded");

// Return all available component registrations
export function AvailableComponents(): ComponentRegistration[] {
    console.log("Available components called")
    return [...componentRegistry.registry];
}

// Trigger creation of component
export function CreateComponent(component: ComponentRegistration) {
    const windowsStore = useWindowsStore();
    windowsStore.createWindow(component);
}

watch(
    () => {
        return componentRegistry.registry.length
    },
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
