import { RenderMode } from "@store/datawindow.types";

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

        window.menuAPI.preload.addComponentRegistration({
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