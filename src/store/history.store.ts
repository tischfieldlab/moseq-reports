import { Module } from 'vuex';
import { RootState } from './root.types';
import { HistoryState, HistoryItem } from './history.types';





const HistoryModule: Module<HistoryState, RootState> = {
    namespaced: true,
    state() {
        return {
            items: [],
         };
    },
    mutations: {
        addEntry(state, payload: string) {
            state.items.push({
                time: new Date(),
                message: payload,
            });
        },
    },
};
export default HistoryModule;
