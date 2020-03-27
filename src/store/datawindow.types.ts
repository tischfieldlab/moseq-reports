

export interface DataWindowState {
    type: string;
    title: string;
    width: number;
    height: number;
    pos_x: number;
    pos_y: number;
    datasource: string;
    settings: object;
}

export interface UpdateComponentLayoutPayload {
    width?: number;
    height?: number;
    position_x?: number;
    position_y?: number;
}

export interface UpdateComponentSettingsPayload {
    settings: any;
}

export interface UpdateComponentTitlePayload {
    title: string;
}
export interface UpdateComponentDataSourcePayload {
    source: string;
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

export interface DataSource {
    name: string;
}

export interface DehydratedDataWindow {
    type: string;
    title: string;
    layout: Layout;
    source?: string;
    settings: object | undefined;
}

