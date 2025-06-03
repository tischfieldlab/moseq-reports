export interface StateMapSettings {
    plot_group: string;
    colorscale: string;
    use_opacity: boolean;
    show_relative_diff: boolean;
    relative_diff_group: string;
    layout: string;
    prune_threshold: number;
    grid_settings: {
        avoid_overlap: boolean;
        avoid_overlap_padding: number;
    };
    circle_settings: {
        avoid_overlap: boolean;
        clockwise: boolean;
    };
    concentric_settings: {
        avoid_overlap: boolean;
        clockwise: boolean;
        equidistant: boolean;
        min_node_spacing: number;
    };
    avsdf_settings: {
        node_separation: number;
    };
    fcose_settings: {
        node_separation: number;
        node_repulsion: number,
        ideal_edge_length: number
    };
    cise_settings: {
        node_separation: number;
        node_repulsion: number,
        ideal_edge_length: number
    };
}

export interface TransData {
    group: string;
    row_id: number;
    col_id: number;
    raw: number;
}

export interface UsageData {
    usage: number;
    group: string;
    syllable: number;
}

export interface Node {
    data: {
        type: string,
        id: number;
        name: string;
        usage: number;
    };
}

export interface Link {
    data: {
        type: string,
        id?: string,
        source: number;
        target: number;
        weight: number;
    };
}

export type LayoutOptions = DefaultLayout|GridLayoutOptions|CircleLayoutOptions|ConcentricLayoutOptions|AvsdfLayoutOptions
                        |FcoseLayoutOptions|CiseLayoutOptions;

export interface DefaultLayout {
    name: string
}
export interface GridLayoutOptions {
    name: 'grid',
    avoidOverlap: boolean,
    avoidOverlapPadding: number
}

export interface CircleLayoutOptions {
    name: 'circle',
    avoidOverlap: boolean,
    clockwise: boolean
}

export interface ConcentricLayoutOptions {
    name: 'concentric',
    avoidOverlap: boolean,
    clockwise: boolean,
    equidistant: boolean,
    minNodeSpacing: number
}

export interface AvsdfLayoutOptions {
    name: 'avsdf',
    nodeSeparation: number
}
export interface FcoseLayoutOptions {
    name: 'fcose',
    nodeSeparation: number,
    nodeRepulsion: number,
    idealEdgeLength: number
}

export interface CiseLayoutOptions {
    name: 'cise',
    nodeSeparation: number,
    nodeRepulsion: number,
    idealEdgeLength: number
}