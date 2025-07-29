import { ColormapSettings, ColumnOrderingSettings, RowOrderingSettings } from "@render/components/Charts/ClusteredHeatmap";

export interface UsageHeatmapSettings extends ColormapSettings, ColumnOrderingSettings, RowOrderingSettings {
    color_columns: boolean;
    color_columns_data: string;
}