interface Spinogram {
    data: SpinogramTimepoint[];
}

interface SpinogramTimepoint {
    x: number[];
    y: number[];
    xy: [number, number][];
    a: number;
    t: number;
}

interface SpinogramSettings {
    line_color: string;
    line_weight: number;
}
