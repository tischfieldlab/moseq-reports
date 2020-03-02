import { RootState } from '@/store/root.types';
import { Module } from 'vuex';
import Vue from 'vue';

interface DatasetsState {
    bundle: string; // path to the bundle
    name: string; // basename of the bundle
    path: string; // path to uncompressed data
    spinogram: any[];
    usageByUsage: any;
    usageByFrames: any;
    groups: string[];
    label_map: any;
}

const DatasetsModule: Module<DatasetsState, RootState> = {
    namespaced: true,
    state: {
        bundle: '',
        name: '',
        path: '',
        spinogram: [],
        usageByUsage: null,
        usageByFrames: null,
        groups: [],
        label_map: null,
    },
    mutations: {
        SetDataSourceInfo(state, payload: any) {
            state.bundle = payload.bundle;
            state.name = payload.name;
            state.path = payload.path;
        },
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
            Vue.set(state, 'groups', [...data]);
        },
        SetLabelMap(state, data: any) {
            state.label_map = data;
        },
    },
};

export default DatasetsModule;
