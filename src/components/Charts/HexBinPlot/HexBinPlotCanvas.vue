<template>
    <canvas ref='canvas' :width='width' :height='height'></canvas>
</template>


<script lang="ts">
import Vue from 'vue';
import { debounce } from 'ts-debounce';
import ColorScaleLegend from '@/components/Core/ColorScaleLegend.vue';
import LoadingMixin from '@/components/Core/LoadingMixin';
import mixins from 'vue-typed-mixins';
import HexBinPlotBase from './HexBinPlotBase.vue';



export default mixins(HexBinPlotBase).extend({
    components: {
        ColorScaleLegend,
    },
    data() {
        return {
            vueCanvas: null as CanvasRenderingContext2D | null,
            debouncedDraw: () => {/**/},
        };
    },
    mounted() {
        this.debouncedDraw = debounce(this.draw, 100);

        Object.keys(this.$props).forEach((key) => {
            this.watchers.push(this.$watch(key, () => {
                this.debouncedDraw();
            }));
        });
        Object.keys(this.$data).forEach((key) => {
            this.watchers.push(this.$watch(key, () => {
                this.debouncedDraw();
            }));
        });
        this.debouncedDraw();
    },
    methods: {
        draw() {
            this.$emit('start-loading');
            this.$forceNextTick().then(() => {
                const c = this.$refs.canvas as HTMLCanvasElement;
                this.vueCanvas = c.getContext('2d');
                if (this.vueCanvas === null) {
                    return; // bail out
                }
                this.vueCanvas.save();
                // clear canvas
                this.vueCanvas.clearRect(0, 0, this.width, this.height);

                this.vueCanvas.textAlign = 'center';
                this.vueCanvas.textBaseline = 'bottom';
                this.vueCanvas.fillStyle = 'black';
                this.vueCanvas.fillText(this.title, this.width / 2, 20);

                this.vueCanvas.translate(this.margin.left, this.margin.top);

                for (const cell of this.scale.gl) {
                    this.vueCanvas.save();
                    this.vueCanvas.translate(cell.pos.x, cell.pos.y);
                    this.vueCanvas.textAlign = 'center';
                    this.vueCanvas.textBaseline = 'bottom';
                    this.vueCanvas.fillStyle = 'black';
                    this.vueCanvas.fillText(cell.data, cell.pos.width / 2, 0);

                    if (this.binned[cell.data] !== undefined) {
                        for (const h of this.binned[cell.data]) {
                            this.vueCanvas.save();
                            this.vueCanvas.translate(h.x + (cell.pos.paddingX / 2), h.y + 20);
                            this.vueCanvas.beginPath();
                            this.vueCanvas.strokeStyle = 'rgba(0,0,0,0.1)';
                            this.vueCanvas.lineWidth = 0;
                            this.vueCanvas.fillStyle = this.scale.c(h.z);
                            const p = new Path2D(this.hexbin.hexagon());
                            this.vueCanvas.stroke(p);
                            this.vueCanvas.fill(p);
                            this.vueCanvas.restore();
                        }
                    }
                    this.vueCanvas.restore();
                }
                this.vueCanvas.restore();
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