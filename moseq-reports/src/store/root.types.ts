

export interface RootState {
    window_count: number;
    windows: DataWindow[];
    registry: ComponentRegistration[];
}

export interface ComponentRegistration {
    friendly_name: string;
    component_type: string;
    settings_type?: string;
    default_settings?: object;
    init_width?: number;
    init_height?: number;
}

export interface Size {
    width: number;
    height: number;
}

export interface Position {
    x: number;
    y: number;
}

export interface Layout extends Size {
    position: Position;
}

export interface DataWindow {
    spec: ComponentRegistration;
    id: number;
    title: string;
    layout: Layout;
    settings: object | undefined;
}

export interface ChangeLayoutPayload {
    id: number;
    width?: number;
    height?: number;
    position_x?: number;
    position_y?: number;
}

export interface UpdateComponentSettingsPayload {
    id: number;
    settings: any;
}


export function createDataWindow(componentInfo: ComponentRegistration) {
    return {
        spec: componentInfo,
        title: componentInfo.friendly_name,
        layout: {
            width: componentInfo.init_width || 200,
            height: componentInfo.init_height || 300,
            position: {
                x: 250,
                y: 60,
            },
        },
        settings: JSON.parse(JSON.stringify(componentInfo.default_settings || {})), // deep clone
    } as DataWindow;
}


