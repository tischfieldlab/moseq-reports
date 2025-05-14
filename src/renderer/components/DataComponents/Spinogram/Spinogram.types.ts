interface Spinogram {
    data: SpinogramTimepoint[];
}

interface SpinogramTimepoint {
    x: number[];
    y: number[];
    xy: number[][];
    a: number;
    t: number;
}

interface SpinogramSettings {
    line_color: string;
    line_weight: number;
}
