import { RootState } from './root.types';
import {
    DataWindowState,
    UpdateComponentLayoutPayload,
    UpdateComponentTitlePayload,
    UpdateComponentDataSourcePayload,
    UpdateComponentSettingsPayload,
    RenderMode,
    UpdateComponentRenderModePayload,
    UpdateComponentZIndexPayload,
    UpdateComponentAspectRatio,
    UpdateComponentAspectRatioByWidthAndHeight,
} from './datawindow.types';
import { Module } from 'vuex';
import stateMerge from 'vue-object-merge';
import { applyAspectRatio, isValidHeight, isValidWidth, isValidX, isValidY } from '@/components/Core/Window/util';


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
            render_mode: RenderMode.UNDEFINED,
            settings: {},
            z_index: 1000,
            aspect_ratio: undefined,
         };
    },
    getters: {
        spec(state, getters, rootState, rootGetters) {
            return rootGetters.getSpecification(state.type);
        },
        zIndex(state) {
            return state.z_index;
        },
        aspectRatio(state) {
            return state.aspect_ratio;
        }
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
            state.render_mode = payload.render_mode;
            state.z_index = payload.z_index
            state.aspect_ratio = payload.aspect_ratio;
            stateMerge(state.settings, payload.settings);
        },
        updateComponentLayout(state, payload: UpdateComponentLayoutPayload) {
            const deltaX: number = payload.width ? payload.width : state.width;
            const deltaY: number = payload.height ? payload.height : state.height;

            // In the event that this is a resize, we apply the aspect ratio constraints if there is an aspect ratio
            const apsectRatioDims = applyAspectRatio(deltaX, deltaY, state.aspect_ratio);

            if ((payload.width || payload.height) && (isValidWidth(apsectRatioDims.width) && isValidHeight(apsectRatioDims.height))) {
                state.width = apsectRatioDims.width;
                state.height = apsectRatioDims.height;
            }

            if (payload.position_x !== undefined && payload.position_x >= 0 && isValidX(payload.position_x + deltaX)) {
                state.pos_x = payload.position_x;
            }

            if (payload.position_y !== undefined && payload.position_y >= 0 && isValidY(payload.position_y + deltaY)) {
                state.pos_y = payload.position_y;
            }
        },
        updateComponentTitle(state, payload: UpdateComponentTitlePayload) {
            state.title = payload.title;
        },
        updateComponentDataSource(state, payload: UpdateComponentDataSourcePayload) {
            state.datasource = payload.source;
        },
        updateComponentRenderMode(state, payload: UpdateComponentRenderModePayload) {
            state.render_mode = payload.render_mode;
        },
        updateComponentSettings(state, payload: UpdateComponentSettingsPayload) {
            stateMerge(state.settings, payload.settings);
        },
        updateZIndex(state, payload: UpdateComponentZIndexPayload) {
            state.z_index = payload.z_index;
        },
        updateAspectRatio(state, payload: UpdateComponentAspectRatio & UpdateComponentAspectRatioByWidthAndHeight) {
            if (payload.aspect_ratio) {
                state.aspect_ratio = payload.aspect_ratio;
            } else {
                state.aspect_ratio = payload.width / payload.height;
            }
        }
    },
};
export default DataWindowModule;
