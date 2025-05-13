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
    ShowHidePayload,
} from "@store/datawindow.types";
import stateMerge from "vue-object-merge";
// import {
//   applyAspectRatio,
//   isValidHeight,
//   isValidWidth,
// } from "@render/components/Core/Window/util";

import {componentRegistry, ComponentRegistration} from './component_registry.store'
import { defineStore, acceptHMRUpdate } from 'pinia'




export const useDataWindowStore = (id: string) => defineStore(`datawindow-${id}`, {
    state: (): DataWindowState => ({
        type: "",
        title: "",
        width: 0,
        height: 0,
        pos_x: 0,
        pos_y: 0,
        datasource: "",
        render_mode: RenderMode.UNDEFINED,
        settings: {},
        z_index: 1000,
        aspect_ratio: undefined,
        is_hidden: false,
    }),
    getters: {
        spec(state) {
            return componentRegistry.getSpecification(state.type);
        },
        zIndex(state) {
            return state.z_index;
        },
        aspectRatio(state) {
            return state.aspect_ratio;
        },
        isHidden(state) {
            return state.is_hidden;
        },
    },
    actions: {
        replaceState(payload: DataWindowState) {
            console.log("Replacing state with payload:", payload);
            this.type = payload.type;
            this.width = payload.width;
            this.height = payload.height;
            this.pos_x = payload.pos_x;
            this.pos_y = payload.pos_y;
            this.title = payload.title;
            this.datasource = payload.datasource;
            this.render_mode = payload.render_mode;
            this.z_index = payload.z_index;
            this.aspect_ratio = payload.aspect_ratio;
            this.is_hidden = payload.is_hidden;
            stateMerge(this.settings, payload.settings);
        },
        toggleWindowShowHide(payload: ShowHidePayload) {
            this.is_hidden = payload.isHidden;
        },
        updateComponentLayout(payload: UpdateComponentLayoutPayload) {
            const deltaX: number = payload.width ? payload.width : this.width;
            const deltaY: number = payload.height ? payload.height : this.height;
            const clientRect = document.getElementsByClassName("home")[0];
            const maxX = clientRect.clientWidth;
            const maxY = clientRect.clientHeight;
      
            //   // In the event that this is a resize, we apply the aspect ratio constraints if there is an aspect ratio
            //   const apsectRatioDims = applyAspectRatio(
            //     deltaX,
            //     deltaY,
            //     state.aspect_ratio
            //   );
      
            //   if (
            //     (payload.width || payload.height) &&
            //     isValidWidth(apsectRatioDims.width) &&
            //     isValidHeight(apsectRatioDims.height)
            //   ) {
            //     state.width = apsectRatioDims.width;
            //     state.height = apsectRatioDims.height;
            //   }
      
            if (payload.position_x !== undefined) {
                if (payload.position_x < 0) payload.position_x = 0;
                if (payload.position_x + deltaX > maxX) payload.position_x = maxX - this.width;
                this.pos_x = payload.position_x;
            }

            if (payload.position_y !== undefined) {
                if (payload.position_y < 0) payload.position_y = 0;
                if (this.is_hidden && payload.position_y > maxY - 70) payload.position_y = maxY - 70;
                if (!this.is_hidden && payload.position_y + deltaY > maxY) payload.position_y = maxY - this.height - 65;

                this.pos_y = payload.position_y;
            }
        },
        updateComponentTitle(payload: UpdateComponentTitlePayload) {
            this.title = payload.title;
        },
        updateComponentDataSource(payload: UpdateComponentDataSourcePayload) {
            this.datasource = payload.source;
        },
        updateComponentRenderMode(payload: UpdateComponentRenderModePayload) {
            this.render_mode = payload.render_mode;
        },
        updateComponentSettings(payload: UpdateComponentSettingsPayload) {
            stateMerge(this.settings, payload.settings);
        },
        updateZIndex(payload: UpdateComponentZIndexPayload) {
            this.z_index = payload.z_index;
        },
        updateAspectRatio(payload: UpdateComponentAspectRatio & UpdateComponentAspectRatioByWidthAndHeight) {
            if (payload.aspect_ratio) {
                this.aspect_ratio = payload.aspect_ratio;
            } else {
                this.aspect_ratio = payload.width / payload.height;
            }
        },
        resetSize() {
            const spec = componentRegistry.getSpecification(this.type) as ComponentRegistration;
            console.log("data window", spec);
            this.updateComponentLayout({
              width: spec.init_width,
              height: spec.init_height,
            });
        },
    },
})()
/*
if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useDataWindowStore, import.meta.hot))
}*/
