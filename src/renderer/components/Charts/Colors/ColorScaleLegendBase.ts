import Vue from "vue";
import { scaleLinear, ScaleLinear } from "d3-scale";
import { range } from "d3-array";

export enum Orientation {
  Horizontal = "horizontal",
  Vertical = "vertical",
}

export default Vue.component("color-scale-legend", {
  props: {
    scale: {
      type: [Function, Object],
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
    offsets(): any {
      if (this.orientation === Orientation.Horizontal) {
        return {
          x1: "0%",
          x2: "100%",
          y1: "0%",
          y2: "0%",
        };
      } else {
        return {
          x1: "0%",
          x2: "0%",
          y1: "100%",
          y2: "0%",
        };
      }
    },
    axis_translate(): any {
      if (this.orientation === Orientation.Horizontal) {
        return {
          x: 0,
          y: this.height,
        };
      } else {
        return {
          x: this.width / 2,
          y: this.height / 2,
        };
      }
    },
    label_translate(): any {
      if (this.orientation === Orientation.Horizontal) {
        return {
          x: 0,
          y: this.height + 18 + 20,
          r: 0,
        };
      } else {
        return {
          x: -this.height / 2,
          y: this.width + 18 + 20,
          r: -90,
        };
      }
    },
    isHorizontal(): boolean {
      return this.orientation === Orientation.Horizontal;
    },
    linearscale(): ScaleLinear<number, number> {
      const r = this.isHorizontal ? [-this.width / 2, this.width / 2] : [this.height / 2, -this.height / 2];
      const d = this.scale.domain();
      return scaleLinear()
        .domain([d[0], d[d.length - 1]])
        .range(r);
    },
    stops(): { v: number; z: string }[] {
      const d = this.scale.domain();
      const start = d[0];
      const stop = d[d.length - 1];
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
