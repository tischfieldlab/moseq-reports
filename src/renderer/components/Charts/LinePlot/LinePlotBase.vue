<script lang="ts">
import LoadingMixin from "@render/components/Core/LoadingMixin";
import mixins from "vue-typed-mixins";
import { scaleLinear, scalePoint, scaleOrdinal } from "d3-scale";
import { line, Line } from "d3-shape";
import { PropType } from "vue";
import { extent } from "d3-array";
import ToolTip from "@render/components/Charts/ToolTip.vue";
import MessageBox from "@render/components/Charts/CenteredMessage.vue";

function default_tooltip_formatter(value: any, that) {
  return JSON.stringify(value, undefined, "\t");
}

export default mixins(LoadingMixin).extend({
  components: {
    ToolTip,
    MessageBox,
  },
  props: {
    data: {
      required: true,
      type: Array as PropType<object[]>,
    },
    seriesKey: {
      required: true,
      type: String,
    },
    varKey: {
      required: true,
      type: String,
    },
    valueKey: {
      required: true,
      type: String,
    },
    errorKey: {
      type: String,
    },
    showError: {
      type: Boolean,
      default: true,
    },
    varOrdering: {
      type: Array as PropType<any[]>,
    },
    width: {
      required: true,
      type: Number,
    },
    height: {
      required: true,
      type: Number,
    },
    showPoints: {
      default: true,
      type: Boolean,
    },
    pointSize: {
      default: 3,
      type: Number,
    },
    showLines: {
      default: true,
      type: Boolean,
    },
    lineWeight: {
      default: 3,
      type: Number,
    },
    xAxisTitle: {
      type: String,
      default: "Variable",
    },
    yAxisTitle: {
      type: String,
      default: "Value",
    },
    seriesLabels: {
      required: true,
      type: Array as PropType<string[]>,
      default: () => new Array<string>(),
    },
    seriesColors: {
      required: true,
      type: Array as PropType<string[]>,
      default: () => new Array<string>(),
    },
    tooltipFormatter: {
      type: Function,
      default: default_tooltip_formatter,
    },
    hoverCursor: {
      type: String,
      default: "pointer",
    },
  },
  data() {
    return {
      margin: {
        top: 20,
        right: 20,
        bottom: 50,
        left: 60,
      },
      xAxisLabelYPos: 45,
      watchers: Array<() => void>(),
      rotate_labels: false,
      label_stats: { count: 0, total: 0, longest: 0 },
      tooltipPosition: undefined as { x: number; y: number } | undefined,
      hoverItem: undefined as object | undefined,
    };
  },
  computed: {
    origin(): any {
      const x = this.margin.left;
      const y = this.innerHeight + this.margin.top;
      return { x, y };
    },
    innerWidth(): number {
      const width = this.width - this.margin.left - this.margin.right;
      this.rotate_labels = this.label_stats.longest > width / this.label_stats.count;
      if (this.rotate_labels) {
        const rotatedHeight = Math.cos(45 * (Math.PI / 180)) * this.label_stats.longest;
        this.xAxisLabelYPos = rotatedHeight + 20;
      } else {
        this.xAxisLabelYPos = 45;
      }
      this.margin.bottom = this.xAxisLabelYPos + 20;
      return width;
    },
    innerHeight(): number {
      return this.height - this.margin.top - this.margin.bottom;
    },
    has_data(): boolean {
      return this.data !== undefined && this.data !== null && this.data.length > 0;
    },
    seriesPath(): Line<[number, number]> {
      return line()
        .defined((d) => this.isPointValid(d))
        .x((d) => this.scale.x(d[this.varKey]))
        .y((d) => this.scale.y(d[this.valueKey]));
    },
    groupedData(): { [series: string]: {}[] } {
      const series = [...new Set(this.data.map((d) => d[this.seriesKey]))];
      const kludges = this.varOrdering.filter((d) => Number.parseInt(d, 10) < 0);
      const grouped = Object.fromEntries(
        series.map((seriesValue) => {
          return [
            seriesValue,
            this.data
              .filter((d) => d[this.seriesKey] === seriesValue)
              .concat(
                kludges.map((k) => {
                  return {
                    [this.seriesKey]: seriesValue,
                    [this.varKey]: k,
                    [this.valueKey]: undefined,
                  };
                })
              )
              .sort((a, b) => this.varOrdering.indexOf(a[this.varKey]) - this.varOrdering.indexOf(b[this.varKey])),
          ];
        })
      );

      return grouped;
    },
    dataVars(): any[] {
      return [...new Set(this.data.map((d) => d[this.varKey]))];
    },
    scale(): any {
      if (!this.has_data) {
        return { x: scalePoint(), y: scaleLinear(), c: scaleOrdinal() };
      }
      const x = scalePoint()
        .domain(this.varOrdering as string[])
        .range([0, this.innerWidth])
        .padding(0.5);

      let ext = [0, 0];
      if (this.data !== null) {
        ext = extent(
          this.data.flatMap((n) => {
            return [n[this.valueKey], n[this.valueKey] + n[this.errorKey], n[this.valueKey] - n[this.errorKey]];
          })
        ) as [number, number];
      }
      const y = scaleLinear()
        .domain(ext as [number, number])
        .range([this.innerHeight, 0]);

      const c = scaleOrdinal()
        .domain(this.seriesLabels as string[])
        .range(this.seriesColors as string[]);

      return { x, y, c };
    },
    tooltip_text(): string {
      if (this.hoverItem !== undefined) {
        return (this.tooltipFormatter as (itm, that) => string)(this.hoverItem, this);
      }
      return "";
    },
  },
  methods: {
    isPointValid(d: object) {
      return !Number.isNaN(this.scale.x(d[this.varKey])) && !Number.isNaN(this.scale.y(d[this.valueKey]));
    },
    seriesData(seriesValue) {
      return this.data.filter((d) => d[this.seriesKey] === seriesValue);
    },
  },
});
</script>
