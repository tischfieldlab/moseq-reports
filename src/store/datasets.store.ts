import { RootState } from '@/store/root.types';
import { Module } from 'vuex';
import Vue from 'vue';
import { DatasetsState } from './datasets.types';
import path from 'path';
import { unnest } from '@/util/Vuex';



const DatasetsModule: Module<DatasetsState, RootState> = {
    namespaced: true,
    state: {
        isLoaded: false,
        bundle: '',
        name: '',
        manifest: {},
        groups: [],
        label_map: [],
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
            return state.label_map
                        .filter((row) => row.usage >= 0)
                        .map((row) => row.usage)
                        .sort((a, b) => a - b);
        },
        availableFramesModuleIds: (state) => {
            if (!state.label_map) {
                return [];
            }
            return state.label_map
                        .filter((row) => row.frames >= 0)
                        .map((row) => row.frames)
                        .sort((a, b) => a - b);
        },
    },
    mutations: {
        Unload(state) {
            state.isLoaded = false;
            state.bundle = '';
            state.name = '';
            state.manifest = {};
            state.groups = [];
            state.label_map = [];
        },
        SetDataSourceInfo(state, payload: DatasetsState) {
            state.bundle = payload.bundle;
            state.name = payload.name;
            state.manifest = payload.manifest;
        },
        SetGroupInfo(state, data: DatasetsState) {
            Vue.set(state, 'groups', [...data.groups]);
        },
        SetLabelMap(state, data: DatasetsState) {
            state.label_map = data.label_map;
        },
        SetLoaded(state) {
            state.isLoaded = true;
        },
    },
    actions: {
        Unload(context) {
            context.commit('Unload');
        },
        setData(context, payload: DatasetsState) {
            context.commit('SetDataSourceInfo', payload);
            context.commit('SetGroupInfo', payload);
            context.commit('SetLabelMap', payload);
            context.commit('SetLoaded');
        },
    },
};

export default DatasetsModule;
