import { createStore, StoreOptions } from 'vuex';
import {
    RootState,
    ComponentRegistration,
    SidebarPosition
} from './root.types';
import DatasetsStore from './datasets.store';
import FiltersModule from './filters.store';
import WindowsModule from './windows.store';
import HistoryModule from './history.store';

const store: StoreOptions<RootState> = {
    strict: process.env.NODE_ENV !== 'production',
    modules: {
        datasets: DatasetsStore,
        filters: FiltersModule,
        datawindows: WindowsModule,
        history: HistoryModule,
    },
    state: {
        registry: [] as ComponentRegistration[],
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
                console.warn(`${payload.component_type} has already been registered! Merging...`);
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

export default createStore<RootState>(store);
