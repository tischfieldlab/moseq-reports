import Vue from 'vue';
import Vuex, {StoreOptions} from 'vuex';
import {
    RootState,
    ComponentRegistration,
} from './root.types';
import DatasetsStore from '@/store/datasets.store';
import FiltersModule from '@/store/filters.store';
import WindowsModule from './windows.store';

Vue.use(Vuex);

const store: StoreOptions<RootState> = {
    strict: true,
    modules: {
        datasets: DatasetsStore,
        filters: FiltersModule,
        datawindows: WindowsModule,
    },
    state: {
        registry: Array<ComponentRegistration>(),
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
                state.registry.splice(loc, 1, payload);
            }
        },
    },
    actions: {
    },
};

export default new Vuex.Store<RootState>(store);
