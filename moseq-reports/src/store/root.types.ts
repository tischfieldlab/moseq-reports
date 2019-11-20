

export interface RootState {
    window_count: number;
    windows: Array<DataWindow>;
    registry: Array<ComponentRegistration>;
}

export interface ComponentRegistration{
    friendly_name: string;
    component_type: string;
    settings_type: string;
    default_settings: Object;
    init_width: number;
    init_height: number;
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
    type: string;
    layout: Layout;
    settings: Object | undefined;
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


export function createDataWindow(component_info: ComponentRegistration){
    return <DataWindow> {
        spec: component_info,
        title: component_info.friendly_name,
        type: component_info.component_type,
        layout: {
            width: component_info.init_width || 200,
            height: component_info.init_height || 300,
            position: {
                x: 250,
                y: 60,
            }
        },
        settings: JSON.parse(JSON.stringify(component_info.default_settings || {})), //deep clone
    }
}