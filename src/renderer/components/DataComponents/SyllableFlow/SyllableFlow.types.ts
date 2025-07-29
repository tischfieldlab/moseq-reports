import { NodeAlignment } from '@render/components/Charts/Sankey/Sankey.types';

export interface SyllableFlowSettings {
    plot_group: string;
    show_relative_diff: boolean;
    relative_diff_group: string;
    prune_threshold: number;
    colorscale: string;
    node_padding: number;
    node_width: number;
    node_alignment: NodeAlignment;
}

export interface TransitionItem{
    group: string;
    row_id: number;
    col_id: number;
    raw: number;
}