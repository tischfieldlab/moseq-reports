import { RootState } from '@/store/root.types';
import { Module } from 'vuex';

interface DatasetsState {
    spinogram: any[];
    usageByUsage: any;
    usageByFrames: any;
    groups: string[];
    label_map: any;
}

const DatasetsModule: Module<DatasetsState, RootState> = {
    namespaced: true,
    state: {
        spinogram: [],
        usageByUsage: null,
        usageByFrames: null,
        groups: [],
        label_map: null,
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
        SetGroupInfo(state, data: any) {
            state.groups = data;
        },
        SetLabelMap(state, data: any) {
            state.label_map = data;
        },
    },
};

export default DatasetsModule;
