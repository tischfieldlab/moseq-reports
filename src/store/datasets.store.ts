import { RootState } from '@/store/root.types';
import { Module } from 'vuex';
import Vue from 'vue';

interface DatasetsState {
    name: string;
    path: string;
    spinogram: any[];
    usageByUsage: any;
    usageByFrames: any;
    groups: string[];
    label_map: any;
}

const DatasetsModule: Module<DatasetsState, RootState> = {
    namespaced: true,
    state: {
        name: '',
        path: '',
        spinogram: [],
        usageByUsage: null,
        usageByFrames: null,
        groups: [],
        label_map: null,
    },
    mutations: {
        SetDataInfo(state, {name, path}: {name: string, path: string}) {
            state.name = name;
            state.path = path;
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
