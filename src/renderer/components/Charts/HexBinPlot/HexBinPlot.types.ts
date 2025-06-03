export interface Observation {
    x: number;
    y: number;
    id: string;
    group: string;
}

export interface HexBin {
    x: number;
    y: number;
    length: number;
    z: number;
    [key: string]: any;
}