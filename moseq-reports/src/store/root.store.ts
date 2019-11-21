import Vue from 'vue';
import Vuex, {StoreOptions, MutationTree} from 'vuex';
import { RootState, DataWindow, ChangeLayoutPayload, UpdateComponentSettingsPayload, ComponentRegistration } from './root.types';
import { saveFile } from '@/Util';

Vue.use(Vuex);

const store: StoreOptions<RootState> = {
    strict: true,
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
            if (state.registry.find((r) => r.component_type === payload.component_type) === undefined) {
                state.registry.push(payload);
            }
        },
        addWindow(state, payload: DataWindow) {
            payload.id = state.window_count;
            state.window_count++;
            state.windows.push(payload);
        },
        updateLayout(state, payload: ChangeLayoutPayload) {
            const w = state.windows.find((win) => win.id === payload.id);
            if (w !== undefined) {
                w.layout.width = payload.width ? payload.width : w.layout.width;
                w.layout.height = payload.height ? payload.height : w.layout.height;
                w.layout.position.x = payload.position_x ? payload.position_x : w.layout.position.x;
                w.layout.position.y = payload.position_y ? payload.position_y : w.layout.position.y;
            }
        },
        updateComponentSettings(state, payload: UpdateComponentSettingsPayload) {
            const w = state.windows.find((win) => win.id === payload.id);
            if (w !== undefined) {
                if (w.settings === undefined) {
                    w.settings = {};
                }
                for (const k in payload.settings) {
                    Vue.set(w.settings, k, payload.settings[k]);
                }
            }
        },
        clearWindows(state) {
            while(state.windows.length){
                state.windows.pop();
            }
            state.window_count = 0;
        },
    },
    actions: {
        serializeLayout(context) {
            const data = JSON.stringify(context.state.windows, (key, value) => {
                if (key === 'instance') {
                    return undefined;
                }
                return value;
            });
            saveFile('layout.json', 'data:text/json', data);
        },
        loadLayout(context, files: FileList) {
            // if no file selected, return
            if (files === null || files.length === 0) { return; }

            // clear out any existing windows
            context.commit('clearWindows');

            // read the file and apply the layout
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e !== null && e.target !== null) {
                    const data = JSON.parse(e.target.result as string) as DataWindow[];
                    for (const w of data) {
                        context.commit('addWindow', w);
                    }
                } else {
                    console.warn('On load recieved null when reading selected files.');
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
