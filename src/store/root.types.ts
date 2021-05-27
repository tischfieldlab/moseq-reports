
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
}

export enum SidebarPosition {
    Left,
    Right
}
