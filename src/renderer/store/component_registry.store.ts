import { defineStore, acceptHMRUpdate } from 'pinia'
import { RenderMode } from "@store/datawindow.types";
import { ipcRenderer } from 'electron';

export interface ComponentRegistryState {
    registry: ComponentRegistration[];
}

export interface ComponentRegistration {
    friendly_name: string;
    component_type: string;
    settings_type?: string;
    default_settings?: object;
    init_width?: number;
    init_height?: number;
    available_render_modes: RenderMode[];
    default_render_mode: RenderMode;
    is_hidden?: boolean;
    aspect_ratio?: number;
}

/*export const useComponentRegistryStore = defineStore('component-registry', {
    state: (): ComponentRegistryState => ({
        registry: [] as ComponentRegistration[],
    }),
    getters: {
        getSpecification: (state) => (componentType: string) => {
            return state.registry.find((r) => r.component_type === componentType);
        },
    },
    actions: {
        registerComponent(payload: ComponentRegistration) {
            const loc = this.registry.findIndex((r) => r.component_type === payload.component_type);
            if (loc === -1) {
                this.registry.push(payload);
            } else {
                console.warn(`${payload.component_type} has already been registered! Merging...`);
                this.registry.splice(loc, 1, payload);
            }
        },
    },
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useComponentRegistryStore, import.meta.hot))
}*/


class ComponentRegistry {
    public registry: ComponentRegistration[] = [];

    registerComponent(component: ComponentRegistration) {
        const loc = this.registry.findIndex((r) => r.component_type === component.component_type);
        if (loc === -1) {
            this.registry.push(component);
        } else {
            console.warn(`${component.component_type} has already been registered! Merging...`);
            this.registry.splice(loc, 1, component);
        }

        window.menuAPI.addComponentRegistration({
            component_type: component.component_type,
            friendly_name: component.friendly_name
        });
    }

    getSpecification(componentType: string): ComponentRegistration {
        const reg =  this.registry.find((r) => r.component_type === componentType);
        if (!reg) {
            throw new Error(`Component ${componentType} not found in registry`);
        }
        return reg;
    }
}

export const componentRegistry = new ComponentRegistry();