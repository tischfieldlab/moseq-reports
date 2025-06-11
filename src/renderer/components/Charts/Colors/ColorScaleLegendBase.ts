import { ScaleDiverging, scaleLinear, ScaleSequential } from "d3-scale";
import { range } from "d3-array";
import { Orientation } from "./Colors.types";
import { computed } from "vue";



export interface ColorScaleLegendProps {
    scale: ScaleSequential<string, any> | ScaleDiverging<string, any>;
    width: number;
    height: number;
    title?: string;
    orientation?: Orientation;
    maxticks?: number;
    minticks?: number;
    tickformat?: string;
}

export function ColorScaleLegendPropsDefaults() {
    return {
        width: 100,
        height: 10,
        title: "",
        orientation: Orientation.Horizontal,
        maxticks: 5,
        minticks: 1,
    };
}

export function useColorScaleLegendBase(props: ColorScaleLegendProps) {
    const offsets = computed(() => {
        return props.orientation === Orientation.Horizontal
            ? { x1: "0%", x2: "100%", y1: "0%", y2: "0%" }
            : { x1: "0%", x2: "0%", y1: "100%", y2: "0%" };
    });
    const axis_translate = computed(() => {
        return props.orientation === Orientation.Horizontal
            ? { x: 0, y: props.height }
            : { x: props.width / 2, y: props.height / 2 };
    });
    const label_translate = computed(() => {
        return props.orientation === Orientation.Horizontal
            ? { x: 0, y: props.height + 38, r: 0 }
            : { x: -props.height / 2, y: props.width + 38, r: -90 };
    });
    const isHorizontal = computed(() => {
        return props.orientation === Orientation.Horizontal
    });
    const linearscale = computed(() => {
        const rangeValues = isHorizontal
            ? [-props.width / 2, props.width / 2]
            : [props.height / 2, -props.height / 2];

        const domain = props.scale.domain();
        return scaleLinear().domain([domain[0], domain[domain.length - 1]]).range(rangeValues);
    });
    const stops = computed(() => {
        const domain = props.scale.domain();
        const start = domain[0];
        const stop = domain[domain.length - 1];

        return range(start, stop, (stop - start) / 20).map((v) => ({
            v: percentRange(v, start, stop),
            z: props.scale(v),
        }));
    });

    function percentRange(value: number, start: number, stop: number): number {
        return ((value - start) / (stop - start)) * 100;
    }

    return {
        offsets,
        axis_translate,
        label_translate,
        isHorizontal,
        linearscale,
        stops,
        percentRange,
    };
}
