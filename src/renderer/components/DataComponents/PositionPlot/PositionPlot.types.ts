export interface PositionPlotSettings {
    mode: PositionPlotMode;
    resolution: number;
    colormap: string;
}

export enum PositionPlotMode {
    Overall = "Overall",
    Grouped = "Grouped",
}
