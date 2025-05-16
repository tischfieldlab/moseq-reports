import { defineComponent } from "vue";
import { scaleLinear, ScaleContinuousNumeric, ScaleSequential } from "d3-scale";
import { range } from "d3-array";
import { PropType } from "vue";

export enum Orientation {
    Horizontal = "horizontal",
    Vertical = "vertical",
}

export default defineComponent({
    props: {
        scale: {
            type: Object as PropType<ScaleSequential<string>>,
            required: true,
        },
        width: {
            type: Number,
            required: true,
        },
        height: {
            type: Number,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        orientation: {
            type: String,
            default: Orientation.Horizontal,
        },
        maxticks: {
            type: Number,
            default: 5,
        },
        minticks: {
            type: Number,
            default: 1,
        },
        tickformat: {
            type: String,
            default: null,
        },
    },
    computed: {
        offsets() {
            return this.orientation === Orientation.Horizontal
                ? { x1: "0%", x2: "100%", y1: "0%", y2: "0%" }
                : { x1: "0%", x2: "0%", y1: "100%", y2: "0%" };
        },
        axis_translate() {
            return this.orientation === Orientation.Horizontal
                ? { x: 0, y: this.height }
                : { x: this.width / 2, y: this.height / 2 };
        },
        label_translate() {
            return this.orientation === Orientation.Horizontal
                ? { x: 0, y: this.height + 38, r: 0 }
                : { x: -this.height / 2, y: this.width + 38, r: -90 };
        },
        isHorizontal() {
            return this.orientation === Orientation.Horizontal
        },
        linearscale() {
            const rangeValues = this.isHorizontal
                ? [-this.width / 2, this.width / 2]
                : [this.height / 2, -this.height / 2];

            const domain = this.scale.domain();
            return scaleLinear().domain([domain[0], domain[domain.length - 1]]).range(rangeValues);
        },
        stops() {
            const domain = this.scale.domain();
            const start = domain[0];
            const stop = domain[domain.length - 1];

            return range(start, stop, (stop - start) / 20).map((v) => ({
                v: this.percentRange(v, start, stop),
                z: this.scale(v),
            }));
        },
    },
    methods: {
        percentRange(value: number, start: number, stop: number): number {
            return ((value - start) / (stop - start)) * 100;
        },
    },
});
