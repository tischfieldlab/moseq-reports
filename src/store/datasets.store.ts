import { RootState } from '@/store/root.types';
import { Module } from 'vuex';
import Vue from 'vue';

interface DatasetsState {
    spinogram: any[];
    usageByUsage: any;
    usageByFrames: any;
    transitionsByUsage: any;
    transitionsByFrames: any;
    groups: string[];
    label_map: any;
}

const DatasetsModule: Module<DatasetsState, RootState> = {
    namespaced: true,
    state: {
        spinogram: [],
        usageByUsage: null,
        usageByFrames: null,
        transitionsByUsage: null,
        transitionsByFrames: null,
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
        SetTransitionsByUsage(state, data: any) {
            state.transitionsByUsage = data;
        },
        SetTransitionsByFrames(state, data: any) {
            state.transitionsByFrames = data;
        },
        SetGroupInfo(state, data: any) {
            Vue.set(state, 'groups', [...data]);
        },
        SetLabelMap(state, data: any) {
            state.label_map = data;
        },
    },
};

export default DatasetsModule;
