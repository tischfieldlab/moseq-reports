<template>
    <canvas ref='canvas' :width='width' :height='height'>
        <ColorScaleLegend
                :title="legendTitle"
                :scale="scale.c"
                :width="200"
                :height="10"
                :x="width / 2"
                :y="scale.gl.height + 45" />
    </canvas>
</template>


<script lang="ts">
import Vue from 'vue';
import { debounce } from '@/util/Events';
import ColorScaleLegend from '@/components/Charts/ColorScaleLegend/ColorScaleLegendCanvas.vue';
import LoadingMixin from '@/components/Core/LoadingMixin';
import mixins from 'vue-typed-mixins';
import HexBinPlotBase from './HexBinPlotBase.vue';



export default mixins(HexBinPlotBase).extend({
    components: {
        ColorScaleLegend,
    },
    data() {
        return {
            debouncedDraw: () => {/**/},
            canvas: {
                // This is the CanvasRenderingContext that children will draw to.
                cxt: null as CanvasRenderingContext2D | null,
            },
        };
    },
    provide(): {canvas: {cxt: CanvasRenderingContext2D | null}} {
        return {
            canvas: this.canvas,
        };
    },
    mounted() {
        const c = this.$refs.canvas as HTMLCanvasElement;
        this.canvas.cxt = c.getContext('2d');
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
        getLabelFontSize(cxt: CanvasRenderingContext2D, maxWidth: number, labels: string[], fontFace: string) {
            const maxLabel = (labels.map((l) => [l, cxt.measureText(l)]) as [string, TextMetrics][])
                                   .reduce((prev, current) => prev[1].width > current[1].width ? prev : current)
                                   [0];
            cxt.save();
            // start with a large font size
            let fontsize = 300;
            // lower the font size until the text fits the canvas
            do {
                fontsize--;
                cxt.font = `${fontsize}px ${fontFace}`;
            } while (cxt.measureText(maxLabel).width > maxWidth);
            cxt.restore();
            return fontsize;
        },
        draw() {
            this.$emit('start-loading');
            this.$forceNextTick().then(() => {
                const c = this.$refs.canvas as HTMLCanvasElement;
                this.canvas.cxt = c.getContext('2d');
                if (this.canvas.cxt === null) {
                    return; // bail out
                }
                this.canvas.cxt.save();
                // clear canvas
                this.canvas.cxt.clearRect(0, 0, this.width, this.scale.gl.height + this.margin.top);

                // Plot title
                this.canvas.cxt.textAlign = 'center';
                this.canvas.cxt.textBaseline = 'bottom';
                this.canvas.cxt.fillStyle = 'black';
                this.canvas.cxt.font = '13px Verdana';
                this.canvas.cxt.fillText(this.title, this.width / 2, 20);

                // Move to inside the plot margins
                this.canvas.cxt.translate(this.margin.left, this.margin.top);

                // Draw each group
                let labelFontSize = this.getLabelFontSize(this.canvas.cxt,
                                                            this.scale.gl[0].pos.width,
                                                            this.scale.gl.map((cell) => cell.data),
                                                            'Verdana');
                if (labelFontSize > 13) {
                    labelFontSize = 13;
                }
                for (const cell of this.scale.gl) {
                    this.canvas.cxt.save();
                    this.canvas.cxt.translate(cell.pos.x, cell.pos.y);
                    this.canvas.cxt.textAlign = 'center';
                    this.canvas.cxt.textBaseline = 'bottom';
                    this.canvas.cxt.fillStyle = 'black';
                    this.canvas.cxt.font = `${labelFontSize}px Verdana`;
                    const labelWidth = this.canvas.cxt.measureText(cell.data).width;
                    this.canvas.cxt.fillText(cell.data, (cell.pos.width / 2), 0);

                    // Draw each hexagon
                    if (this.binned[cell.data] !== undefined) {
                        for (const h of this.binned[cell.data]) {
                            this.canvas.cxt.save();
                            this.canvas.cxt.translate(h.x + (cell.pos.paddingX / 2), h.y + 20);
                            this.canvas.cxt.beginPath();
                            this.canvas.cxt.strokeStyle = 'rgba(0,0,0,0.1)';
                            this.canvas.cxt.lineWidth = 0;
                            this.canvas.cxt.fillStyle = this.scale.c(h.z);
                            const p = new Path2D(this.hexbin.hexagon());
                            this.canvas.cxt.stroke(p);
                            this.canvas.cxt.fill(p);
                            this.canvas.cxt.restore();
                        }
                    }
                    this.canvas.cxt.restore();
                }
                this.canvas.cxt.restore();
            });
        },
    },
});
</script>
