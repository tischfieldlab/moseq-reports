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
        addEntry(state, payload: Partial<HistoryItem>) {
            state.items.push({
                time: payload.time || new Date(),
                message: payload.message || '',
                variant: payload.variant || 'default',
                details: payload.details || null
            });
        },
    },
};
export default HistoryModule;
