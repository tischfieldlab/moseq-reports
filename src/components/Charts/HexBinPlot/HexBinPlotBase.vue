<script lang="ts">
import Vue from 'vue';
import { hexbin } from 'd3-hexbin';
import { scaleLinear, scaleBand, scaleOrdinal, scaleSequential } from 'd3-scale';
import { GetScale } from '@/components/Charts/Colors/D3ColorProvider';
import { spawn, Thread, Worker, ModuleThread } from 'threads';
import { HexbinWorker } from './Worker';
import gridLayout from '@/components/Charts/D3Layout';
import LoadingMixin from '@/components/Core/LoadingMixin';
import mixins from 'vue-typed-mixins';



if (module.hot) {
    module.hot?.addDisposeHandler(async () => await Thread.terminate(worker));
}
let worker: ModuleThread<HexbinWorker>;
(async () => {
    worker = await spawn<HexbinWorker>(new Worker('./Worker.ts'));
})();


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
        resolution: {
            required: true,
            type: Number,
            default: 10,
        },
        colorscale: {
            required: true,
            type: String,
            default: 'interpolateBuPu',
        },
        groupLabels: {
            required: true,
            type: Array, /* Array<string> */
            default: () => new Array<string>(),
        },
        useGroups: {
            type: Boolean,
            default: false,
        },
        title: {
            required: true,
            type: String,
            default: 'title',
        },
        legendTitle: {
            required: true,
            type: String,
            default: 'title',
        },
        noDataMessage: {
            type: String,
            default: 'Sorry, no data available!',
        },
    },
    data() {
        return {
            watchers: Array<(() => void)>(),
            margin: {
                top: 20,
                right: 20,
                bottom: 70,
                left: 20,
            },
            zmax: 0,
            binned: {},
            domainX: [0, 0],
            domainY: [0, 0],
        };
    },
    watch: {
        /*data: {
            async handler(newValue) {
                if (newValue === null) {
                    return;
                }
                const result = await worker.binData(newValue,
                                                    this.groupLabels as string[],
                                                    this.width,
                                                    this.resolution);
                this.binned = result.binned;
                this.zmax = result.zmax;
                this.domainX = result.domainX;
                this.domainY = result.domainY;
            },
        },*/
    },
    computed: {
        has_data(): boolean {
            return this.data !== undefined && this.data !== null && this.data.length > 0
                && (!this.useGroups || (this.useGroups && this.groupLabels.length > 0));
        },
        colormap(): any {
            return GetScale(this.colorscale);
        },
        innerSize(): {w: number, h: number} {
            return {
                w: this.width - this.margin.left - this.margin.right,
                h: this.height - this.margin.top - this.margin.bottom,
            };
        },
        hexWidth(): number {
            return this.resolution * 2 * Math.sin(Math.PI / 3);
        },
        hexHeight(): number {
            return this.resolution * (3 / 2);
        },
        hexbin(): any {
            return hexbin()
                    .x((d) => this.scale.x(d.x))
                    .y((d) => this.scale.y(d.y))
                    .radius(this.resolution)
                    .size([this.scale.x.range()[1], this.scale.y.range()[0]]);
        },
        scale(): any {
            const gl = gridLayout()
                .size([this.innerSize.w, this.innerSize.h])
                .padding([0.3, 0.5])
                .aspect(1.0)(this.useGroups ? this.groupLabels : ['Overall']);

            if (this.data === null) {
                return { x: scaleLinear(), y: scaleLinear(), c: scaleSequential(this.colormap), gl };
            }

            const xMax = gl.length > 0 ? gl[0].pos.width : 20;
            const x = scaleLinear()
                .domain(this.domainX)
                .range([0, xMax - 20]);

            const yMax = gl.length > 0 ? gl[0].pos.height : 20;
            const y = scaleLinear()
                .domain(this.domainY)
                .range([yMax - 20, 0]);

            const c = scaleSequential(this.colormap)
                .domain([0, this.zmax]);

            return { x, y, c, gl };
        },
    },
    mounted() {
        Object.keys(this.$props).forEach((key) => {
            this.watchers.push(this.$watch(key, () => {
                this.prep_data();
            }));
        });

        this.prep_data();
    },
    destroyed() {
        // un-watch
        this.watchers.forEach((w) => w());
    },
    methods: {
        prep_data() {
            if (this.data === null) {
                return;
            }
            this.emitStartLoading();

            worker.binData(this.data as any[],
                        this.useGroups ? this.groupLabels as string[] : null,
                        this.scale.x.range()[1],
                        this.resolution)
                .then((result) => {
                    if (result !== undefined) {
                        this.binned = result.binned;
                        this.zmax = result.zmax;
                        this.domainX = result.domainX;
                        this.domainY = result.domainY;
                    }
                    this.emitFinishLoading();
                });
        },
    },
});
</script>


<style scoped>
g.group {
    border: 1px solid #666;
}
text.label,
text.title {
    text-anchor:middle;
}
</style>