
<script lang="ts">
import Vue from 'vue';
import * as d3 from 'd3';
import { scaleLinear, scaleBand, scaleOrdinal } from 'd3-scale';
import { max, min, mean, quantile, median, sum, extent } from 'd3-array';
import { area, line, symbol, symbolDiamond } from 'd3-shape';
import { axisBottom, axisLeft } from 'd3-axis';
import { WhiskerType, GroupStats, DataPoint, DataPointQueueNode } from './BoxPlot.types';


export default Vue.extend({
    props: {
        data: {
            required: true,
            type: Array,
        },
        value_name: {
            required: true,
            type: String,
        },
        group_name: {
            required: true,
            type: String,
        },
        id_name: {
            required: true,
            type: String,
        },
        width: {
            required: true,
            type: Number,
        },
        height: {
            required: true,
            type: Number,
        },
        whisker_type: {
            default: WhiskerType.TUKEY,
            type: String,
        },
        show_boxplot: {
            default: true,
            type: Boolean,
        },
        show_points: {
            default: true,
            type: Boolean,
        },
        show_violinplot: {
            default: false,
            type: Boolean,
        },
        point_size: {
            default: 2,
            type: Number,
        },
        groupLabels: {
            required: true,
            type: Array, /* Array<string> */
            default: () => new Array<string>(),
        },
        groupColors: {
            required: true,
            type: Array, /* Array<string> */
            default: () => new Array<string>(),
        },
        xAxisTitle: {
            type: String,
            default: 'Group',
        },
        yAxisTitle: {
            type: String,
            default: 'Value',
        },
    },
    data() {
        return {
            points: Array<DataPoint>(),
            groupedData: Array<GroupStats>(),
            margin: {
                top: 20,
                right: 20,
                bottom: 50,
                left: 60,
            },
            xAxisLabelYPos: 45,
            watchers: Array<(() => void)>(),
            rotate_labels: false,
            label_stats: {count: 0, total: 0, longest: 0},
        };
    },
    beforeDestroy() {
        this.watchers.forEach((unwatch) => unwatch());
    },
    computed: {
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
        halfBandwith(): number {
            return this.scale.x.bandwidth() / 2;
        },
        quaterBandwith(): number {
            return this.scale.x.bandwidth() / 4;
        },
        origin(): any {
            const x = this.margin.left;
            const y = this.innerHeight + this.margin.top;
            return { x, y };
        },
        scale(): any {
            if (this.points === undefined) {
                return { x: scaleBand(), y: scaleLinear() };
            }
            const x = scaleBand()
                .domain(this.groupLabels as string[])
                .range([0, this.innerWidth])
                .padding(0.2);

            const y = scaleLinear()
                .domain([0, max(this.points.map((i) => i.value)) as number])
                .range([this.innerHeight, 0]);

            const kdeMax = Math.max(...this.groupedData.map((g) => Math.max(...g.kde.map((k) => k[1]))));
            const w = scaleLinear()
                .domain([-kdeMax, kdeMax])
                .range([0, x.bandwidth()]);

            const c = scaleOrdinal()
                .domain(this.groupLabels as string[])
                .range(this.groupColors as string[]);

            return { x, y, w, c };
        },
        fences() {
            switch (this.whisker_type) {
                case WhiskerType.MIN_MAX:
                    return {
                        lower: (gs: GroupStats) => gs.min,
                        upper: (gs: GroupStats) => gs.max,
                    };
                case WhiskerType.TUKEY:
                    return {
                        lower: (gs: GroupStats) => Math.max(gs.q1 - (1.5 * gs.iqr), gs.min),
                        upper: (gs: GroupStats) => Math.min(gs.q3 + (1.5 * gs.iqr), gs.max),
                    };
                default:
                    throw new Error(`Unsupported Whisker Type ${this.whisker_type}!`);
            }
        },
        violinArea(): any {
            const a = area()
                .x0((d) => this.scale.w(d[1]))
                .x1((d) => this.scale.w(-d[1]))
                .y((d) => this.scale.y(d[0]));
            return a;
        },
        violinLine(): any {
            const a = line()
                .x((d) => this.scale.w(d[1]))
                .y((d) => this.scale.y(d[0]));
            return a;
        },
        diamond(): any {
            // try to match the area of the circle and diamond
            const d = symbol()
                .type(symbolDiamond)
                .size(2 * Math.sqrt(2 * (Math.PI * this.point_size ** 2)));
            return d;
        },
    },
    watch: {
        data: {
            handler(newData) {
                if (newData === null) {
                    return;
                }
                newData = newData.rename(this.value_name, 'value');
                newData = newData.rename(this.id_name, 'id');
                this.points = newData.toCollection();
                this.swarm_points(this.points);

                this.groupedData = (this.groupLabels as string[]).map((g) => {
                    const values = newData.where({[this.group_name]: g})
                                    .select('value')
                                    .sortBy('value', true)
                                    .toArray();
                    return this.computeGroupStats(values, g);
                });
                this.compute_label_stats(this.groupLabels as string[]);
            },
            immediate: true,
        },
        width() {
            this.compute_label_stats(this.groupLabels as string[]);
        },
        point_size(newValue) {
            this.swarm_points(this.points);
        },
    },
    methods: {
        computeGroupStats(data: number[], group: string): GroupStats {
            const kde = this.kernelDensityEstimator(this.epanechnikovKernel(.01), this.scale.y.ticks(100));
            const gstats = {
                group,
                count: data.length,
                min: min(data) as number,
                max: max(data) as number,
                mean: mean(data) as number,
                median: median(data) as number,
                q1: quantile(data, 0.25) as number,
                q2: quantile(data, 0.5) as number,
                q3: quantile(data, 0.75) as number,
                kde: kde(data),
            } as GroupStats;
            gstats.iqr = gstats.q1 - gstats.q3;
            return gstats as GroupStats;
        },
        kernelDensityEstimator(kernel: (u: number) => number, x: number[]): (sample: number[]) => number[][] {
            return (sample: number[]) => {
                return x.map((y) => [y, mean(sample, (v: number) => kernel(y - v))]) as number[][];
            };
        },
        epanechnikovKernel(scale: number): (u: number) => number {
            return (u: number) => {
                return Math.abs(u /= scale) <= 1 ? .75 * (1 - u * u) / scale : 0;
            };
        },
        is_outlier(node: DataPoint): boolean {
            const group = this.groupedData.find((v) => v.group === node.group);
            if (group) {
                return node.value < this.fences.lower(group)
                    || node.value > this.fences.upper(group);
            }
            return false;
        },
        point_tooltip(item: DataPoint): string {
            return `<div style="text-align:left;">
                        ${item.group}<br />
                        ${item.id}<br />
                        ${item.value.toExponential(3)}
                    </div>`;
        },
        swarm_points(data: DataPoint[]) {
            this.groupLabels.map((g) => {
                const pointSize = this.point_size as number;
                const radius2 = (pointSize * 2.5) ** 2;
                let head: DataPointQueueNode | null = null;
                let tail: DataPointQueueNode | null = null;
                const indv = data.filter((ui) => ui.group === g)
                                 .map((ui) => { ui.jitter = 0; return ui; }) as DataPointQueueNode[];

                const intersects = (x, y) => {
                    const epsilon = 1e-5;
                    let item = head;
                    while (item) {
                        const dx = (item.jitter - x) ** 2;
                        const dy = (this.scale.y(item.value) - this.scale.y(y)) ** 2;
                        if (radius2 - epsilon >= dx + dy) {
                            return true;
                        }
                        item = item.next;
                    }
                    return false;
                };

                for (const b of indv) {
                    // Remove circles from the queue that can’t intersect the new circle b.
                    while (head && this.scale.y(head.value) < (this.scale.y(b.value) - radius2)) {
                        head = head.next;
                    }
                    // Choose the minimum non-intersecting tangent.
                    b.jitter = 0;
                    if (intersects(b.jitter, b.value)) {
                        let a = head;
                        b.jitter = Infinity;
                        do {
                            const dy = Math.sqrt(radius2 - (this.scale.y(a!.value) - this.scale.y(b.value)) ** 2);
                            const j = a!.jitter + dy;

                            if (j < b.jitter) {
                                if (!intersects(j, b.value)) {
                                    b.jitter = j;
                                } else if (j < b.jitter && !intersects(-j, b.value)) {
                                    b.jitter = -j;
                                }
                            }
                            a = a!.next;
                        } while (a);
                        if (b.jitter === Infinity) {
                            // console.log('Got Infinity?', b);
                        }
                    }
                    // Add b to the queue.
                    b.next = null;
                    if (head === null) {
                        head = tail = b;
                    } else {
                        tail = tail!.next = b;
                    }
                }
            });
        },
        compute_label_stats(labels: string[]) {
            // abstract implementation
        },
    },
});
</script>
