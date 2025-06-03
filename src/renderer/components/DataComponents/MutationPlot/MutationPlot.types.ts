import { OrderingType } from "@render/components/Charts/ClusteredHeatmap";
import { SortOrderDirection } from "@render/components/Charts/common.types";

export interface MutationPlotSettings {
    show_points: boolean;
    point_size: number;
    show_lines: boolean;
    line_weight: number;
    show_errors: boolean;
    error_type: string;
    group_order_type: OrderingType;
    syllable_order_type: OrderingType;
    syllable_order_group_value: string;
    syllable_order_direction: SortOrderDirection;
    syllable_order_dataset: string;
    syllable_order_diff_minuend: string;
    syllable_order_diff_subtrahend: string;
}





export interface PlotData {
    group: string;
    syllable: number;
    value: number;
    count: number;
    deviation: number;
    sem: number;
    ci95: number
}