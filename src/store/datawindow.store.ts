import { RootState } from './root.types';
import {
    DataWindowState,
    UpdateComponentLayoutPayload,
    UpdateComponentTitlePayload,
    UpdateComponentDataSourcePayload,
    UpdateComponentSettingsPayload,
} from './datawindow.types';
import { Module } from 'vuex';
import stateMerge from 'vue-object-merge';



const DataWindowModule: Module<DataWindowState, RootState> = {
    namespaced: true,
    state() {
        return {
            type: '',
            title: '',
            width: 0,
            height: 0,
            pos_x: 0,
            pos_y: 0,
            datasource: '',
            settings: {},
         };
    },
    getters: {
        spec(state, getters, rootState, rootGetters) {
            return rootGetters.getSpecification(state.type);
        },
    },
    mutations: {
        replaceState(state, payload: DataWindowState) {
            state.type = payload.type;
            state.width = payload.width;
            state.height = payload.height;
            state.pos_x = payload.pos_x;
            state.pos_y = payload.pos_y;
            state.title = payload.title;
            state.datasource = payload.datasource;
            stateMerge(state.settings, payload.settings);
        },
        updateComponentLayout(state, payload: UpdateComponentLayoutPayload) {
            if (payload.width) { state.width = payload.width; }
            if (payload.height) { state.height = payload.height; }
            if (payload.position_x) { state.pos_x = payload.position_x; }
            if (payload.position_y) { state.pos_y = payload.position_y; }
        },
        updateComponentTitle(state, payload: UpdateComponentTitlePayload) {
            state.title = payload.title;
        },
        updateComponentDataSource(state, payload: UpdateComponentDataSourcePayload) {
            state.datasource = payload.source;
        },
        updateComponentSettings(state, payload: UpdateComponentSettingsPayload) {
            stateMerge(state.settings, payload.settings);
        },
    },
};
export default DataWindowModule;