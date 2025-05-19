import { DehydratedDataWindow, DataWindowState } from "@store/datawindow.types";
import { clone } from "@render/util/Object";
import { defineStore, acceptHMRUpdate } from 'pinia'

import {useDataWindowStore} from './datawindow.store'
import { useFiltersStore } from './filters.store'
import { componentRegistry, ComponentRegistration } from "./component_registry.store";
import { ipcRenderer } from "electron";
import { MenuEvents } from "@main/shared/menuAPI";
import { defaultOptionsFromSpec } from "@render/components/Core/SnapshotHelper";

export interface WindowsState {
    basename: string;
    items: string[];
}


export const useWindowsStore = defineStore('windows', {
    state: (): WindowsState => ({
        basename: "datawindow",
        items: [],
    }),
    getters: {
        windowsUsingDataView: (state) => (dataView) => {
            return state.items.filter((wNamespace) => {
                return useDataWindowStore(wNamespace).datasource == dataView;
            });
        },
        windowsMaxZIndex: (state): number => {
            let maxZIndex: number = 0;
            state.items.forEach((item: string) => {
                const winState: DataWindowState = useDataWindowStore(item);
                if (winState.z_index > maxZIndex) {
                    maxZIndex = winState.z_index;
                }
            });

            return maxZIndex;
        },
        numberOfWindows(state) {
            return state.items.length;
        },
    },
    actions: {
        addWindow(namespace: string) {
            this.items.push(namespace);
        },
        removeWindow(namespace: string) {
            const start = this.items.indexOf(namespace);
            this.items.splice(start, 1);
            const store = useDataWindowStore(namespace);
            store.$dispose();
        },
        clearWindows() {
            this.items.length = 0;
        },
        createWindow(component: ComponentRegistration) {
            const ws = createDataWindow(component);
            this.commitWindow(ws);
        },
        hydrateWindow(data: DehydratedDataWindow) {
            const ws = hydrateWindow(data);
            this.commitWindow(ws);
        },
        commitWindow(windowState: DataWindowState) {
            let i = 0;
            while (true) {
                const name = `${i}`;
                if (!this.items.includes(name)) {
                    const store = useDataWindowStore(name);
                    store.replaceState(windowState);
                    this.addWindow(name);
                    return name;
                }
                i++;
            }
        },
        duplicateWindow(namespace: string) {
            // grab a copy of the window state
            const winstate = dehydrateWindow(useDataWindowStore(namespace).$state);
            // Prefix the window title to differentiate
            winstate.title = "Copy of " + winstate.title;
            // shift the window position a bit in x and y
            winstate.layout.position.x += 30;
            winstate.layout.position.y += 30;
            // add the modified window back into the windows store
            this.hydrateWindow(winstate);
        },
        clearLayout() {
            const namespaces = [...this.items];
            this.clearWindows();
            for (const namespace of namespaces) {
                useDataWindowStore(namespace).$dispose();
            }
        },
        serializeLayout(): DehydratedDataWindow[] {
            const dehydrated = this.items.map((id) => {
                return dehydrateWindow(useDataWindowStore(id).$state);
            });
            return dehydrated;
        },
        async loadLayout(layout: DehydratedDataWindow[]) {
            // clear out any existing windows
            this.clearLayout();
            for (const dh of layout) {
                this.hydrateWindow(dh);
            }
        },
    },
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useWindowsStore, import.meta.hot))
}

// Handle create-component
ipcRenderer.on(MenuEvents.CREATE_COMPONENT, (_event, component: ComponentRegistration) => {
    //console.log("✅ Received create-component event:", component);
    const spec = componentRegistry.getSpecification(component.component_type);
    const windowsStore = useWindowsStore();
    windowsStore.createWindow(spec);
});

function createDataWindow(component: ComponentRegistration): DataWindowState {
    if (!component) {
        throw new Error("Component is undefined in createDataWindow");
    }
    const state = {
        type: component.component_type,
        title: component.friendly_name,
        width: component.init_width || 200,
        height: component.init_height || 300,
        pos_x: 250,
        pos_y: 10,
        z_index: useWindowsStore().windowsMaxZIndex,
        datasource: useFiltersStore().default,
        render_mode: component.default_render_mode,
        aspect_ratio: component.aspect_ratio,
        settings: clone(component.default_settings || {}), // deep clone
        is_hidden: component.is_hidden || false,
    } as DataWindowState;

    state.settings.snapshot = defaultOptionsFromSpec(component);

    return state;
}

function dehydrateWindow(window: DataWindowState): DehydratedDataWindow {
    const dehydrated = {
        type: window.type,
        title: window.title,
        layout: {
            width: window.width,
            height: window.height,
            position: {
                x: window.pos_x,
                y: window.pos_y,
            },
        },
        source: window.datasource,
        render_mode: window.render_mode,
        settings: window.settings,
        z_index: window.z_index,
        aspect_ratio: window.aspect_ratio,
        is_hidden: window.is_hidden,
    };
    return dehydrated;
}

function hydrateWindow(data: DehydratedDataWindow): DataWindowState {
    const spec = componentRegistry.getSpecification(data.type) as ComponentRegistration;
    const windowStore = useWindowsStore();
    if (!spec) {
        console.warn(`Specification for type "${data.type}" not found. Skipping this entry.`);
    }
    const win = createDataWindow(spec);
    const maxZ: number = windowStore.windowsMaxZIndex + 1;
    win.title = clone(data.title || spec.friendly_name);
    win.width = data.layout.width || win.width;
    win.height = data.layout.height || win.height;
    win.pos_x = data.layout.position.x || win.pos_x;
    win.pos_y = data.layout.position.y || win.pos_y;
    win.datasource = data.source || win.datasource;
    win.render_mode = data.render_mode || win.render_mode;
    win.settings = { ...win.settings, ...clone(data.settings) };
    win.settings.snapshot = {...defaultOptionsFromSpec(spec), ...win.settings.snapshot};
    win.z_index = data.z_index || maxZ;
    win.aspect_ratio = data.aspect_ratio;
    win.is_hidden = data.is_hidden || false;

    return win;
}
