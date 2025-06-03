import { ColormapSettings, ColumnOrderingSettings, RowOrderingSettings } from "@render/components/Charts/ClusteredHeatmap/Options/Options.types";

export interface BehavioralDistanceHeatmapSettings extends ColormapSettings, ColumnOrderingSettings, RowOrderingSettings {
    distance_metric: string;
}