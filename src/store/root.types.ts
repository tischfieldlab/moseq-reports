import { RenderMode } from './datawindow.types';

export interface RootState {
    registry: ComponentRegistration[];
    sidebarPosition: SidebarPosition;
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

export enum SidebarPosition {
    Left,
    Right
}
