import { RootState } from '@/store/root.types';
import { Module } from 'vuex';
import Vue from 'vue';
import DataFrame from 'dataframe-js';
import { DatasetsState } from './datasets.types';



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
    getters: {
        availableUsageModuleIds: (state) => {
            if (state.usageByUsage === null) {
                return [];
            }
            return new DataFrame(state.usageByUsage.data, state.usageByUsage.columns)
                .distinct('syllable')
                .sortBy('syllable')
                .toArray('syllable');
        },
        availableFramesModuleIds: (state) => {
            if (state.usageByFrames === null) {
                return [];
            }
            return new DataFrame(state.usageByFrames.data, state.usageByFrames.columns)
                .distinct('syllable')
                .sortBy('syllable')
                .toArray('syllable');
        },
    },
    mutations: {
        SetDataSourceInfo(state, payload: DatasetsState) {
            state.bundle = payload.bundle;
            state.name = payload.name;
            state.path = payload.path;
        },
        SetSpinogramData(state, data: DatasetsState) {
            state.spinogram = data.spinogram;
        },
        SetUsageByUsage(state, data: DatasetsState) {
            state.usageByUsage = data.usageByUsage;
        },
        SetUsageByFrames(state, data: DatasetsState) {
            state.usageByFrames = data.usageByFrames;
        },
        SetGroupInfo(state, data: DatasetsState) {
            Vue.set(state, 'groups', [...data.groups]);
        },
        SetLabelMap(state, data: DatasetsState) {
            state.label_map = data.label_map;
        },
    },
    actions: {
        setData(context, payload: DatasetsState) {
            context.commit('SetDataSourceInfo', payload);
            context.commit('SetSpinogramData', payload);
            context.commit('SetUsageByUsage', payload);
            context.commit('SetUsageByFrames', payload);
            context.commit('SetGroupInfo', payload);
            context.commit('SetLabelMap', payload);
        },
    },
};

export default DatasetsModule;
