import store from '@/store/root.store';

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

export interface DehydratedDataWindow {
    type: string;
    title: string;
    layout: Layout;
    settings: object | undefined;
}

export interface UpdateComponentLayoutPayload {
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

export interface UpdateComponentTitlePayload {
    id: number;
    title: string;
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
                y: 10,
            },
        },
        settings: __clone(componentInfo.default_settings || {}), // deep clone
    } as DataWindow;
}

export function dehydrateWindow(window: DataWindow): DehydratedDataWindow {
    return {
        type: window.spec.component_type,
        title: window.title,
        layout: window.layout,
        settings: window.settings,
    };
}
export function hydrateWindow(data: DehydratedDataWindow): DataWindow {
    const spec = store.getters.getSpecification(data.type) as ComponentRegistration;
    const win = createDataWindow(spec);
    win.title = __clone(data.title || spec.friendly_name);
    win.layout = { ...win.layout, ...__clone(data.layout) };
    win.settings = { ...win.settings, ...__clone(data.settings) };
    return win;
}

function __clone(obj: any) {
    return JSON.parse(JSON.stringify(obj));
}


