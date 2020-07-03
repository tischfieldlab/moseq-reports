import { Module } from 'vuex';
import { RootState } from './root.types';


interface HistoryState {
    items: HistoryItem[];
}

interface HistoryItem {
    time: Date;
    message: string;
}


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
