export interface Spinogram {
    data: SpinogramTimepoint[];
}

export interface SpinogramTimepoint {
    x: number[];
    y: number[];
    xy: [number, number][];
    a: number;
    t: number;
}

export interface SpinogramSettings {
    line_color: string;
    line_weight: number;
}
