import { RootState } from '@/store/root.types';
import { Module } from 'vuex';

interface DatasetsState {
    spinogram: any[];
}

const DatasetsModule: Module<DatasetsState, RootState> = {
    namespaced: true,
    state: {
        spinogram: [],
    },
    mutations: {
        SetSpinogramData(state, data: []) {
            state.spinogram = data;
        },
    },
};

export default DatasetsModule;
