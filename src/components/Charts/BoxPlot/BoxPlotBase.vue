
<script lang="ts">
import { scaleLinear, scaleBand, scaleOrdinal } from 'd3-scale';
import { area, line, symbol, symbolDiamond } from 'd3-shape';
import { WhiskerType, GroupStats, DataPoint, DataPointQueueNode } from './BoxPlot.types';
import { spawn, Thread, Worker, ModuleThread } from 'threads';
import { BoxPlotWorker } from './Worker';
import LoadingMixin from '@/components/Core/LoadingMixin';
import mixins from 'vue-typed-mixins';



if (module.hot) {
    module.hot?.addDisposeHandler(async () => await Thread.terminate(worker));
}
let worker: ModuleThread<BoxPlotWorker>;
(async () => {
    worker = await spawn<BoxPlotWorker>(new Worker('./Worker.ts'));
    // Thread.errors(worker).subscribe(error => console.log('Thread error:', error));
    // Thread.events(worker).subscribe(event => console.log('Thread event:', event));
})();


function default_tooltip_formatter(value: any, that) {
    if (value !== undefined){
        if (value.hasOwnProperty('id')) {
            const itm = value as DataPoint;
            return `ID: ${itm.id}<br />
                    Value: ${itm.value.toExponential(3)}`;
        } else if(value.hasOwnProperty('count')) {
            const itm = value as GroupStats;
            return `Group: ${itm.group}<br />
                    Count: ${itm.count.toString()}<br />
                    Median: ${itm.q2.toExponential(3)}<br />`;
        } else {
            return JSON.stringify(value, undefined, '\t');
        }
    }
    return '';
}


export default mixins(LoadingMixin).extend({
    props: {
        data: {
            required: true,
            type: Array,
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
        tooltipFormatter: {
            type: Function,
            default: default_tooltip_formatter,
        },
        noDataMessage: {
            type: String,
            default: 'Sorry, no data available!',
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
            domainY: [0, 0],
            domainKde: [0, 0],
            tooltipPosition: undefined as {x: number, y:number}|undefined,
            hoverItem: undefined as object|undefined,
        };
    },
    beforeDestroy() {
        this.watchers.forEach((unwatch) => unwatch());
    },
    computed: {
        has_data(): boolean {
            return this.data !== undefined && this.data !== null && this.data.length > 0;
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
                .domain(this.domainY)
                .range([this.innerHeight, 0]);

            const w = scaleLinear()
                .domain(this.domainKde)
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
        actuallyShowPoints(): boolean {
            const tooMany = this.points.length > 10000;
            if (tooMany) {
                // tslint:disable-next-line:no-console
                console.warn(`Too many points (${this.points.length}): disableing show points`);
            }
            return this.show_points && !tooMany;
        },
        tooltip_text(): string {
            if (this.hoverItem !== undefined){
                return (this.tooltipFormatter as (itm, that) => string)(this.hoverItem, this);
            }
            return '';
        },
    },
    watch: {
        data: {
            async handler(newData: DataPoint[]) {
                if (newData === null) {
                    return;
                }
                worker.prepareData(newData as any[],
                            this.innerHeight,
                            this.point_size,
                            this.groupLabels as string[],
                            this.show_points)
                    .then((result) => {
                        if (result !== undefined) {
                            this.points = result.points;
                            this.groupedData = result.groupedData,
                            this.domainY = result.domainY;
                            this.domainKde = result.domainKde,
                            this.compute_label_stats(this.groupLabels as string[]);
                        }
                    });
            },
            immediate: true,
        },
        width() {
            this.compute_label_stats(this.groupLabels as string[]);
        },
        async point_size(newValue) {
            const result = await worker.swarm_points(this.points,
                                                     this.groupLabels  as string[],
                                                     {domain: this.scale.y.domain(), range: this.scale.y.range()},
                                                     this.point_size);
            this.points = result;
        },
    },
    methods: {
        is_outlier(node: DataPoint): boolean {
            const group = this.groupedData.find((v) => v.group === node.group);
            if (group) {
                return node.value < this.fences.lower(group)
                    || node.value > this.fences.upper(group);
            }
            return false;
        },
        compute_label_stats(labels: string[]) {
            // abstract implementation
        },
    },
});
</script>
