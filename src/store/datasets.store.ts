import { RootState } from '@/store/root.types';
import { Module } from 'vuex';

interface DatasetsState {
    spinogram: any[];
    usageByUsage: any;
    usageByFrames: any;
}

const DatasetsModule: Module<DatasetsState, RootState> = {
    namespaced: true,
    state: {
        spinogram: [],
        usageByUsage: null,
        usageByFrames: null,
    },
    mutations: {
        SetSpinogramData(state, data: []) {
            state.spinogram = data;
        },
        SetUsageByUsage(state, data: any) {
            state.usageByUsage = data;
        },
        SetUsageByFrames(state, data: any) {
            state.usageByFrames = data;
        },
    },
};

export default DatasetsModule;
