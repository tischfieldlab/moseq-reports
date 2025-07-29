import { WhiskerType, OrderingType } from "@render/components/Charts/BoxPlot";
import { transition } from "d3";

export const availableMetrics = {
    entropy: {
        title: "Entropy",
        is_per_syllable: false,
        source: "entropy",
    },
    entropy_rate_bigram: {
        title: "Bigram Entropy Rate",
        is_per_syllable: false,
        source: "entropy",
    },
    entropy_rate_rows: {
        title: "Outgoing Entropy Rate",
        is_per_syllable: false,
        source: "entropy",
    },
    entropy_rate_columns: {
        title: "Incoming Entropy Rate",
        is_per_syllable: false,
        source: "entropy",
    },
    trans_entropy_incoming: {
        title: "Incoming Transition Entropy",
        is_per_syllable: true,
        source: "trans_entropy",
    },
    trans_entropy_outgoing: {
        title: "Outgoing Transition Entropy",
        is_per_syllable: true,
        source: "trans_entropy",
    },
};

export interface EntropySettings {
    entropy_metric: string;
    show_points: boolean;
    point_size: number;
    show_boxplot: boolean,
    show_violinplot: boolean,
    violin_kde_scale: number,
    boxplot_whiskers: WhiskerType;
    group_order_type: OrderingType;
    group_order_dataset: string;
}
