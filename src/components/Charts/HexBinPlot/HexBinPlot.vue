<template>
    <svg ref="canvas" :width="width" :height="height" >
        <g :transform="`translate(${margin.left},${margin.top})`">
            <g
                v-for="cell in scale.gl"
                :key="cell.data"
                :data-group="cell.data"
                :transform="`translate(${cell.pos.x},${cell.pos.y})`"
                class="group">

                <!--<rect
                    :x="(-hexWidth / 2) - 1"
                    :y="-hexHeight / 2 - 3"
                    :width="cell.pos.width + hexWidth + 2"
                    :height="cell.pos.height + hexHeight + 2"
                    stroke="#666"
                    fill="transparent" />-->

                <text
                    :x="cell.pos.width / 2"
                    :y="cell.pos.height+(cell.pos.paddingY / 2)"
                    class="label">
                    {{cell.data}}
                </text>

                <template v-for="h in binned[cell.data]">
                    <path
                        :key="h.x+h.y"
                        :d="hexbin.hexagon()"
                        :transform="`translate(${h.x},${h.y})`"
                        :fill="scale.c(h.z)"
                        :data-z="h.z"
                        stroke="#000"
                        stroke-opacity="0.1" />
                </template>
            </g>
        </g>
        <ColorScaleLegend
                :title="`Relative Occupancy of Module`"
                :scale="scale.c"
                :width="200"
                :height="10"
                :transform="`translate(${width / 2},${this.height-60})`" />
    </svg>
</template>

<script lang="ts">
import Vue from 'vue';
import { debounce } from 'ts-debounce';
import { hexbin } from 'd3-hexbin';
import { scaleLinear, scaleBand, scaleOrdinal, scaleSequential } from 'd3-scale';
import { max, min, mean, quantile, median, sum, extent } from 'd3-array';
import { GetScale } from '@/util/D3ColorProvider';
import { groupby } from '@/util/Array';
import { spawn, Thread, Worker, ModuleThread } from 'threads';
import { HexbinWorker } from './Worker';
import gridLayout from '@/util/D3Layout';
import ColorScaleLegend from '@/components/Core/ColorScaleLegend.vue';

let worker: ModuleThread<HexbinWorker>;
(async () => {
    worker = await spawn<HexbinWorker>(new Worker('./Worker.ts'));
})();
if (module.hot) {
    module.hot?.addDisposeHandler(async () => await Thread.terminate(worker));
}

export default Vue.extend({
    components: {
        ColorScaleLegend,
    },
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
        groupLabels: {
            required: true,
            type: Array, /* Array<string> */
            default: () => new Array<string>(),
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
        colormap(): any {
            return GetScale('interpolateBuPu');
        },
        innerSize(): {w: number, h: number} {
            return {
                w: this.width - this.margin.left - this.margin.right,
                h: this.height - this.margin.top - this.margin.bottom,
            };
        },
        resolution(): number {
            return 10;
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
            if (this.data === null) {
                return { x: scaleLinear(), y: scaleLinear(), c: scaleSequential(this.colormap) };
            }

            const gl = gridLayout()
                .size([this.innerSize.w, this.innerSize.h])
                .padding(0.3)
                .aspect(1.0)(this.groupLabels);

            const x = scaleLinear()
                .domain(this.domainX)
                .range([0, gl[0].pos.width]);

            const y = scaleLinear()
                .domain(this.domainY)
                .range([gl[0].pos.height, 0]);

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
            this.$emit('start-loading');
            this.$nextTick().then(async () => {
                const result = await worker.binData(this.data as any[],
                                                    this.groupLabels as string[],
                                                    this.scale.x.range()[1],
                                                    this.resolution);
                if (result !== undefined) {
                    this.binned = result.binned;
                    this.zmax = result.zmax;
                    this.domainX = result.domainX;
                    this.domainY = result.domainY;
                }
                this.$emit('finish-loading');
            });
        },
    },
});
</script>


<style scoped>
g.group {
    border: 1px solid #666;
}
text.label {
    text-anchor:middle;
}
</style>