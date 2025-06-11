import { ColormapSettings, ColumnOrderingSettings, RowOrderingSettings } from "@render/components/Charts/ClusteredHeatmap";

export enum TransitionsHeatmapMode {
    Overall = "Overall",
    SingleGroup = "SingleGroup",
    GroupDifference = "GroupDifference",
}

export enum TransitionsNormalization {
    Bigram = "Bigram",
    Rows = "Rows",
    Columns = "Columns",
}


export interface TransitionsHeatmapSettings extends ColormapSettings, ColumnOrderingSettings, RowOrderingSettings {
    mode: TransitionsHeatmapMode;
    selected_group: string;
    relative_group: string;
    normalization: TransitionsNormalization;
}