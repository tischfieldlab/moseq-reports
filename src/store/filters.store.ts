import { Module } from 'vuex';
import { RootState } from './root.types';
import store from './root.store';
import { getModuleNamespace } from '@/util/Vuex';
import DataviewModule from './dataview.store';

interface FiltersState {
    basename: string;
    items: string[];
}

const FiltersModule: Module<FiltersState, RootState> = {
    namespaced: true,
    state() {
        return {
            basename: 'dataview',
            items: [],
         };
    },
    mutations: {
        addFilter(state, namespace: string) {
            state.items.push(namespace);
        },
    },
    getters: {
        default(state) {
            return state.items[0];
        },
    },
    actions: {
        async addFilter(context) {
            const namespace = getModuleNamespace(store, context.state) as string;
            let i = 0;
            while (true) {
                const name = `${context.state.basename}-${i}`;
                if (store.state[namespace][name] === undefined) {
                    const fullpath = `${namespace}/${name}`;
                    store.registerModule([namespace, name], DataviewModule, {});
                    if ((store.state as any).datasets.usageByUsage !== null) {
                        await store.dispatch(`${fullpath}/initialize`);
                    }
                    context.commit('addFilter', fullpath);
                    return fullpath;
                }
                i++;
            }
        },
    },
};
export default FiltersModule;
