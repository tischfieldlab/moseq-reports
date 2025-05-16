export enum WhiskerType {
    TUKEY = "tukey",
    MIN_MAX = "min_max",
}

export enum OrderingType {
    Natural = "natural",
    Dataset = "dataset",
}

export interface DataPoint {
    id: string;
    value: number;
    group: string;
    jitter: number;
}

export function isDataPoint(obj: any): obj is DataPoint {
    return typeof obj === 'object' && obj !== null && 'id' in obj && 'value' in obj && 'group' in obj;
}

export interface DataPointQueueNode extends DataPoint {
    next: DataPointQueueNode | null;
}

export interface GroupStats {
    group: string;
    count: number;
    min: number;
    max: number;
    mean: number;
    median: number;
    q1: number;
    q2: number;
    q3: number;
    iqr: number;
    kde: [number, number][];
}

export function isGroupStats(obj: any): obj is GroupStats {
    return typeof obj === 'object'
        && obj !== null
        && 'group' in obj
        && 'count' in obj
        && 'min' in obj
        && 'max' in obj
        && 'mean' in obj
        && 'median' in obj
        && 'q1' in obj
        && 'q2' in obj
        && 'q3' in obj
        && 'iqr' in obj
        && 'kde' in obj;
}

export interface ToolTipPosition {
    x: number;
    y: number;
}
