export interface Observation {
    x: number;
    y: number;
    id: string;
    group: string;
}

export interface HexBin {
    x: number;
    y: number;
    length: number;
    z: number;
    [key: string]: any;
}

export interface HexBinPlotBaseProps {
    data: Observation[];
    width: number;
    height: number;
    resolution: number;
    useGroups: boolean;
    colorscale: string;
    groupLabels: string[];
    title: string;
    legendTitle: string;
    noDataMessage?: string;
}

export const HexBinPlotBasePropsDefaults = {
    resolution: 10,
    useGroups: false,
    colorscale: 'interpolateBuPu',
    title: 'title',
    legendTitle: 'title',
    noDataMessage: 'Sorry, no data available!',
};
