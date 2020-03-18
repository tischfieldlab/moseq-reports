import Vue from 'vue';
import Vuex, {StoreOptions} from 'vuex';
import {
    RootState,
    DataWindow,
    UpdateComponentLayoutPayload,
    UpdateComponentSettingsPayload,
    ComponentRegistration,
    dehydrateWindow,
    DehydratedDataWindow,
    hydrateWindow,
    UpdateComponentTitlePayload,
} from './root.types';
import { saveFile } from '@/util/Files';
import DefaultLayout from '@/DefaultLayout';
import DatasetsStore from '@/store/datasets.store';
import * as DataviewStore from '@/store/dataview.store';

Vue.use(Vuex);

const store: StoreOptions<RootState> = {
    strict: true,
    modules: {
        datasets: DatasetsStore,
        // dataview: DataviewStore,
    },
    state: {
        registry: Array<ComponentRegistration>(),
        window_count: 0,
        windows: Array<DataWindow>(),
    },
    getters: {
        getWindowById: (state) => (id: number) => {
            return state.windows.find((w) => w.id === id);
        },
        getWindowLayout: (state, getters) => (id: number) => {
            return getters.getWindowById(id).layout;
        },
        getSpecification: (state) => (componentType: string) => {
            return state.registry.find((r) => r.component_type === componentType);
        },
    },
    mutations: {
        registerComponent(state, payload: ComponentRegistration) {
            const loc = state.registry.findIndex((r) => r.component_type === payload.component_type);
            if (loc === -1) {
                state.registry.push(payload);
            } else {
                state.registry.splice(loc, 1, payload);
            }
        },
        addWindow(state, payload: DataWindow) {
            payload.id = state.window_count++;
            state.windows.push(payload);
        },
        removeWindow(state, id: number) {
            const start = state.windows.findIndex((w) => w.id === id);
            state.windows.splice(start, 1);
        },
        updateComponentLayout(state, payload: UpdateComponentLayoutPayload) {
            const w = state.windows.find((win) => win.id === payload.id);
            if (w !== undefined) {
                w.layout.width = payload.width ? payload.width : w.layout.width;
                w.layout.height = payload.height ? payload.height : w.layout.height;
                w.layout.position.x = payload.position_x ? payload.position_x : w.layout.position.x;
                w.layout.position.y = payload.position_y ? payload.position_y : w.layout.position.y;
            }
        },
        updateComponentTitle(state, payload: UpdateComponentTitlePayload) {
            const w = state.windows.find((win) => win.id === payload.id);
            if (w !== undefined) {
                w.title = payload.title;
            }
        },
        updateComponentSettings(state, payload: UpdateComponentSettingsPayload) {
            const w = state.windows.find((win) => win.id === payload.id);
            if (w !== undefined) {
                if (w.settings === undefined) {
                    w.settings = {};
                }
                for (const k of Object.keys(payload.settings)) {
                    Vue.set(w.settings, k, payload.settings[k]);
                }
            }
        },
        clearLayout(state) {
            state.windows = new Array<DataWindow>();
        },
    },
    actions: {
        serializeLayout(context) {
            const dehydrated = context.state.windows.map(dehydrateWindow);
            const data = JSON.stringify(dehydrated);
            saveFile('layout.json', 'data:text/json', data);
        },
        async loadLayout(context, layout: DehydratedDataWindow[]) {
            // clear out any existing windows
            context.commit('clearLayout');

            // very important to wait for next tick!!!
            await Vue.nextTick();

            for (const dh of layout) {
                context.commit('addWindow', hydrateWindow(dh));
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


export default new Vuex.Store<RootState>(store);
