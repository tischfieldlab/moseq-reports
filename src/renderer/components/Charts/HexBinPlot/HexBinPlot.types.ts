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
export interface HexBinWorkerAPI {
    binData: (
        data: Observation[],
        groupLabels: string[] | null,
        width: number,
        resolution: number
    ) => Promise<{
        binned: Record<string, HexBin[]>;
        zmax: number;
        domainX: [number, number];
        domainY: [number, number];
    }>;
}