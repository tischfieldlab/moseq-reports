export enum WhiskerType {
    TUKEY = "tukey",
    MIN_MAX = "min_max",
}

export interface DataPoint {
    id: string;
    value: number;
    group: string;
    jitter: number;
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
    kde: number[][];
}
