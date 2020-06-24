import { RootState } from '@/store/root.types';
import { Module } from 'vuex';
import Vue from 'vue';
import DataFrame from 'dataframe-js';
import { DatasetsState } from './datasets.types';
import path from 'path';
import { unnest } from '@/util/Vuex';



const DatasetsModule: Module<DatasetsState, RootState> = {
    namespaced: true,
    state: {
        bundle: '',
        name: '',
        path: '',
        manifest: {},
        groups: [],
        label_map: null,
    },
    getters: {
        resolve: (state) => (filename: string) => {
            const mani = unnest(state.manifest, filename);
            if (mani) {
                filename = mani;
            }
            return path.join(state.bundle, filename);
        },
        availableUsageModuleIds: (state) => {
            if (!state.label_map) {
                return [];
            }
            return new DataFrame(state.label_map.data, state.label_map.columns)
                .where((row) => row.get('usage') >= 0)
                .sortBy('usage')
                .toArray('usage');
        },
        availableFramesModuleIds: (state) => {
            if (!state.label_map) {
                return [];
            }
            return new DataFrame(state.label_map.data, state.label_map.columns)
                .where((row) => row.get('frames') >= 0)
                .sortBy('frames')
                .toArray('frames');
        },
    },
    mutations: {
        SetDataSourceInfo(state, payload: DatasetsState) {
            state.bundle = payload.bundle;
            state.name = payload.name;
            state.path = payload.path;
            state.manifest = payload.manifest;
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
            context.commit('SetGroupInfo', payload);
            context.commit('SetLabelMap', payload);
        },
    },
};

export default DatasetsModule;
