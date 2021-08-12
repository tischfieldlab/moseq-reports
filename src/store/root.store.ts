import Vue from 'vue';
import Vuex, {StoreOptions} from 'vuex';
import {
    RootState,
    ComponentRegistration,
    SidebarPosition
} from './root.types';
import DatasetsStore from '@/store/datasets.store';
import FiltersModule from '@/store/filters.store';
import WindowsModule from './windows.store';
import HistoryModule from './history.store';

Vue.use(Vuex);

const store: StoreOptions<RootState> = {
    strict: process.env.NODE_ENV !== 'production',
    modules: {
        datasets: DatasetsStore,
        filters: FiltersModule,
        datawindows: WindowsModule,
        history: HistoryModule,
    },
    state: {
        registry: Array<ComponentRegistration>(),
        sidebarPosition: SidebarPosition.Left,
    },
    getters: {
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
                // tslint:disable-next-line:no-console
                console.warn(`${payload.component_type} has already been registered! Merging...`)
                state.registry.splice(loc, 1, payload);
            }
        },
        setSidebarPosition(state, payload: SidebarPosition) {
            state.sidebarPosition = payload;
        },
    },
    actions: {
    },
};

export default new Vuex.Store<RootState>(store);
