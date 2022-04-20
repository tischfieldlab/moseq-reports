export interface DataWindowState {
    type: string;
    title: string;
    width: number;
    height: number;
    pos_x: number;
    pos_y: number;
    datasource: string;
    render_mode: RenderMode;
    settings: object;
    z_index: number;
    aspect_ratio?: number;
}

export interface MinMaxPayload {
    height: number;
}

export interface UpdateComponentLayoutPayload {
    width?: number;
    height?: number;
    position_x?: number;
    position_y?: number;
}

export interface UpdateComponentAspectRatio {
    aspect_ratio: number;
}

export interface UpdateComponentAspectRatioByWidthAndHeight {
    width: number;
    height: number;
}

export interface UpdateComponentZIndexPayload {
    z_index: number;
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
export interface UpdateComponentRenderModePayload {
    render_mode: RenderMode;
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
    render_mode?: RenderMode;
    settings: object | undefined;
    z_index?: number;
    aspect_ratio?: number;
}

export enum RenderMode {
    CANVAS = "canvas",
    SVG = "svg",
    HTML = "html",
    VIDEO = "video",
    UNDEFINED = "undefined",
}
