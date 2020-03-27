import { Module } from 'vuex';
import { RootState, ComponentRegistration } from '@/store/root.types';
import { DehydratedDataWindow, DataWindowState } from './datawindow.types';
import store from './root.store';
import { getModuleNamespace, unnest } from '@/util/Vuex';
import DataWindowModule from './datawindow.store';
import { saveFile } from '@/util/Files';
import DefaultLayout from '@/DefaultLayout';
import Vue from 'vue';
import { clone } from '@/util/Object';

interface WindowsState {
    basename: string;
    items: string[];
}

const WindowsModule: Module<WindowsState, RootState> = {
    namespaced: true,
    state() {
        return {
            basename: 'datawindow',
            items: [],
         };
    },
    mutations: {
        addWindow(state, namespace: string) {
            state.items.push(namespace);
        },
        removeWindow(state, namespace: string) {
            const start = state.items.findIndex((id) => id === namespace);
            state.items.splice(start, 1);
        },
    },
    actions: {
        createWindow(context, component: ComponentRegistration) {
            const ws = createDataWindow(component);
            context.dispatch('commitWindow', ws);
        },
        hydrateWindow(context, data: DehydratedDataWindow) {
            const ws = hydrateWindow(data);
            context.dispatch('commitWindow', ws);
        },
        commitWindow(context, windowState: DataWindowState) {
            const namespace = getModuleNamespace(store, context.state) as string;
            let i = 0;
            while (true) {
                const name = `${context.state.basename}-${i}`;
                if (store.state[namespace][name] === undefined) {
                    const fullpath = `${namespace}/${name}`;
                    store.registerModule([namespace, name], DataWindowModule, {});
                    context.commit(`${fullpath}/replaceState`, windowState, { root: true });
                    context.commit('addWindow', fullpath);
                    return fullpath;
                }
                i++;
            }
        },
        removeWindow(context, namespace: string) {
            context.commit('removeWindow', namespace);
            store.unregisterModule(namespace);
        },
        async clearLayout(context) {
            const rs = context.state.items.map((id) => context.dispatch('removeWindow', id));
            await Promise.allSettled(rs);
        },
        serializeLayout(context) {
            const dehydrated = context.state.items.map((id) => {
                dehydrateWindow(unnest(context.rootState, id));
            });
            const data = JSON.stringify(dehydrated);
            saveFile('layout.json', 'data:text/json', data);
        },
        async loadLayout(context, layout: DehydratedDataWindow[]) {
            // clear out any existing windows
            await context.dispatch('clearLayout');

            for (const dh of layout) {
                context.dispatch('hydrateWindow', dh);
            }
        },
        loadDefaultLayout(context) {
            context.dispatch('loadLayout', DefaultLayout);
        },
        loadLayoutFromFile(context, files: FileList) {
            // if no file selected, return
            if (files === null || files.length === 0) { return; }

            // read the file and apply the layout
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e !== null && e.target !== null) {
                    const data = JSON.parse(e.target.result as string) as DehydratedDataWindow[];
                    context.dispatch('loadLayout', data);
                } else {
                    throw new Error('On load recieved null when reading selected files.');
                }
            };
            const f = files.item(0);
            if (f !== null) {
                reader.readAsText(f);
            }
        },
    },
};
export default WindowsModule;




function createDataWindow(component: ComponentRegistration) {
    return {
        type: component.component_type,
        title: component.friendly_name,
        width: component.init_width || 200,
        height: component.init_height || 300,
        pos_x: 250,
        pos_y: 10,
        datasource: store.getters['filters/default'],
        settings: clone(component.default_settings || {}), // deep clone
    } as DataWindowState;
}

function dehydrateWindow(window: DataWindowState): DehydratedDataWindow {
    return {
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
        settings: window.settings,
    };
}
function hydrateWindow(data: DehydratedDataWindow): DataWindowState {
    const spec = store.getters.getSpecification(data.type) as ComponentRegistration;
    const win = createDataWindow(spec);
    win.title = clone(data.title || spec.friendly_name);
    win.width = data.layout.width || win.width;
    win.height = data.layout.height || win.height;
    win.pos_x = data.layout.position.x || win.pos_x;
    win.pos_y = data.layout.position.y || win.pos_y;
    win.datasource = data.source || win.datasource;
    win.settings = { ...win.settings, ...clone(data.settings) };
    return win;
}
