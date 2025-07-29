import { WhiskerType, OrderingType } from "@render/components/Charts/BoxPlot";

export interface DetailedUsageSettings {
    show_points: boolean;
    point_size: number;
    show_boxplot: boolean,
    show_violinplot: boolean,
    violin_kde_scale: number,
    boxplot_whiskers: WhiskerType;
    group_order_type: OrderingType;
    group_order_dataset: string;
}