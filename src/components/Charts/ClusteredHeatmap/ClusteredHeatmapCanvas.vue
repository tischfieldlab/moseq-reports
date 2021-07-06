<template>
    <div class="clustered-heatmap-container">
        <canvas ref="canvas" v-show="has_data"
            v-dpiadapt="{width: width, height: height}"
            @click="handleHeatmapClick"
            @mousemove="debouncedHover"
            @mouseleave="hoverItem = undefined">
            <ColorScaleLegend ref="legend"
                    :title="legendTitle"
                    :scale="scale.z"
                    :width="dims.legend.w"
                    :height="10"
                    :x="dims.legend.x"
                    :y="dims.legend.y" />
        </canvas>
        <MessageBox :show="!has_data">{{noDataMessage}}</MessageBox>
        <ToolTip :position="tooltipPosition" :show="hoverItem !== undefined">
            <div v-html="tooltip_text" style="text-align:left;"></div>
        </ToolTip>
    </div>
</template>


<script lang="ts">
import Vue from 'vue';
import * as d3 from 'd3';
import { sum } from 'd3';
import ColorScaleLegend from '@/components/Charts/Colors/ColorScaleLegendCanvas.vue';
import mixins from 'vue-typed-mixins';
import ClusteredHeatmapBase from './ClusteredHeatmapBase.vue';
import { debounce, throttle } from '@/util/Events';
import ToolTip from '@/components/Charts/ToolTip.vue';
import CanvasMixin from '@/components/Charts/Canvas';
import MessageBox from '@/components/Charts/CenteredMessage.vue';



export default mixins(ClusteredHeatmapBase, CanvasMixin).extend({
    components: {
        ColorScaleLegend,
        ToolTip,
        MessageBox,
    },
    data() {
        return {};
    },
    mounted() {
        this.debouncedDraw = debounce(this.draw, 50);
        this.debouncedHover = throttle(this.handleHeatmapHover, 10);

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
            const cxt = this.canvas.cxt;
            if (cxt === null) {
                return;
            }

            cxt.save();
            // clear canvas
            cxt.clearRect(0, 0, this.width, this.dims.legend.y);

            this.drawHeatmapCells(cxt);
            this.drawRowDendrogram(cxt);
            this.drawColumnDendrogram(cxt);
            this.drawAxisX(cxt);
            this.drawAxisY(cxt);

            cxt.restore();
            (this.$refs.legend as Vue).$forceUpdate();
        },
        drawHeatmapCells(cxt: CanvasRenderingContext2D) {
            cxt.save();
            cxt.translate(this.dims.heatmap.x, this.dims.heatmap.y);
            for (const node of this.data as object[]) {
                cxt.beginPath();
                cxt.rect(this.scale.x(node[this.columnKey]),
                        this.scale.y(node[this.rowKey]),
                        this.scale.x.bandwidth(),
                        this.scale.y.bandwidth());
                cxt.fillStyle = this.scale.z(node[this.valueKey]);
                cxt.strokeStyle = this.scale.z(node[this.valueKey]);
                cxt.fill();
                cxt.stroke();
            }
            cxt.restore();
        },
        drawRowDendrogram(cxt: CanvasRenderingContext2D) {
            if (!this.isRowsHClustered) {
                return;
            }
            cxt.save();
            cxt.translate(this.dims.rtree.x, this.dims.rtree.y);
            for (const link of this.rowLinks) {
                cxt.beginPath();
                cxt.strokeStyle = '#aaa';
                cxt.lineWidth = 1.5;
                const p = new Path2D(this.elbowH(link));
                cxt.stroke(p);
            }
            cxt.restore();
        },
        drawColumnDendrogram(cxt: CanvasRenderingContext2D) {
            if (!this.isColumnsHClustered) {
                return;
            }
            cxt.save();
            cxt.translate(this.dims.ctree.x, this.dims.ctree.y);
            for (const link of this.columnLinks) {
                cxt.beginPath();
                cxt.strokeStyle = '#aaa';
                cxt.lineWidth = 1.5;
                const p = new Path2D(this.elbowV(link));
                cxt.stroke(p);
            }
            cxt.restore();
        },
        drawAxisX(ctx: CanvasRenderingContext2D) {
            ctx.save();
            ctx.beginPath();
            ctx.translate(this.dims.xaxis.x, this.dims.xaxis.y);

            // main domain line
            // ctx.moveTo(this.scale.x.range()[0], 0);
            // ctx.lineTo(this.scale.x.range()[1], 0);

            // iterate over our x domain values
            this.scale.x.domain().forEach((d) => {
                if (!this.shouldHideLabel(d)) {
                    // tell canvas to draw lines at the bottom of our bars
                    ctx.moveTo(this.scale.x(d) + (this.scale.x.bandwidth() / 2), 0);
                    ctx.lineTo(this.scale.x(d) + (this.scale.x.bandwidth() / 2), 6);
                }
            });

            // set our stroke style to black & draw it
            ctx.strokeStyle = '#000';
            ctx.stroke();

            // apply x-axis labels
            if  (this.rotate_labels) {
                this.scale.x.domain().forEach((d) => {
                    if (!this.shouldHideLabel(d)) {
                        ctx.save();
                        ctx.translate(this.scale.x(d) + (this.scale.x.bandwidth() / 2), 6);
                        ctx.rotate(-Math.PI / 4);
                        ctx.textAlign = 'right';
                        ctx.textBaseline = 'top';
                        ctx.fillStyle = 'black';
                        ctx.fillText(d, 0, 0);
                        ctx.restore();
                    }
                });
            } else {
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillStyle = 'black';

                this.scale.x.domain().forEach((d) => {
                    if (!this.shouldHideLabel(d)) {
                        ctx.fillText(d,
                                    this.scale.x(d) + (this.scale.x.bandwidth() / 2),
                                    6);
                    }
                });
            }

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'black';
            ctx.font = '13px Verdana';
            ctx.fillText(this.xAxisTitle, this.dims.xaxis.w / 2, this.dims.xaxis.ly);
            ctx.restore();

            ctx.restore();
        },
        drawAxisY(ctx: CanvasRenderingContext2D) {
            ctx.save();
            ctx.translate(this.dims.yaxis.x, this.dims.yaxis.y);

            /*ctx.strokeStyle = '#000';
            ctx.beginPath();
            ctx.moveTo(0, this.scale.y.range()[0]);
            ctx.lineTo(0, this.scale.y.range()[1]);
            ctx.stroke();*/

            // apply y-axis labels and ticks
            this.scale.y.domain().forEach((d) => {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 1;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'black';
                ctx.font = '8px Verdana,Arial,sans-serif';
                if (!this.shouldHideLabel(d)) {
                    if (this.selectedRow.toString() === d.toString()) {
                        ctx.beginPath();
                        ctx.lineWidth = 2;
                        ctx.moveTo(0, this.scale.y(d) + (this.scale.y.bandwidth() / 2));
                        ctx.lineTo(18, this.scale.y(d) + (this.scale.y.bandwidth() / 2));
                        ctx.stroke();
                        ctx.font = 'bold 16px Verdana,Arial,sans-serif';
                        ctx.fillText(d, 20, this.scale.y(d) + (this.scale.y.bandwidth() / 2));
                    } else {
                        ctx.beginPath();
                        ctx.moveTo(0, this.scale.y(d) + (this.scale.y.bandwidth() / 2));
                        ctx.lineTo(6, this.scale.y(d) + (this.scale.y.bandwidth() / 2));
                        ctx.stroke();
                        ctx.fillText(d, 9, this.scale.y(d) + (this.scale.y.bandwidth() / 2));
                    }
                }
            });

            ctx.save();
            ctx.rotate(-Math.PI / 2);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = '13px Verdana';
            ctx.fillText(this.yAxisTitle, -this.dims.yaxis.h / 2, 50);
            ctx.restore();

            ctx.restore();
        },
        compute_label_stats(labels: string[]) {
            const cxt = this.canvas.cxt;
            if (cxt !== null) {
                const widths = labels.map((l) => {
                    return cxt.measureText(l).width;
                });
                this.label_stats = {
                    count: labels.length,
                    total: sum(widths),
                    longest: Math.max(...widths),
                };
                return;
            }
            // if canvas is not available yet (i.e. before fully mounted)
            // then schedule the calculation for the next tick
            this.$nextTick(() => this.compute_label_stats(labels));
            return;
        },
        handleHeatmapClick(event: MouseEvent) {
            for (const node of this.data as object[]) {
                const x1 = this.dims.heatmap.x + this.scale.x(node[this.columnKey]);
                const y1 = this.dims.heatmap.y + this.scale.y(node[this.rowKey]);
                const x2 = this.dims.heatmap.x + this.scale.x(node[this.columnKey]) + this.scale.x.bandwidth();
                const y2 = this.dims.heatmap.y + this.scale.y(node[this.rowKey]) + this.scale.y.bandwidth();

                if (event.offsetX > x1 && event.offsetX <= x2
                 && event.offsetY > y1 && event.offsetY <= y2) {
                    this.$emit('heatmap-click', {
                        e: event,
                        row: node[this.rowKey],
                        col: node[this.columnKey],
                        value: node[this.valueKey],
                    });
                    return;
                }
            }
        },
        handleHeatmapHover(event: MouseEvent) {
            for (const node of this.data as object[]) {
                const x1 = this.dims.heatmap.x + this.scale.x(node[this.columnKey]);
                const y1 = this.dims.heatmap.y + this.scale.y(node[this.rowKey]);
                const x2 = this.dims.heatmap.x + this.scale.x(node[this.columnKey]) + this.scale.x.bandwidth();
                const y2 = this.dims.heatmap.y + this.scale.y(node[this.rowKey]) + this.scale.y.bandwidth();

                if (event.offsetX > x1 && event.offsetX <= x2
                 && event.offsetY > y1 && event.offsetY <= y2) {
                    this.tooltipPosition = {
                        x: event.clientX,
                        y: event.clientY
                    };
                    this.hoverItem = node;
                    (this.$el as HTMLElement).style.cursor = 'crosshair';
                    return;
                }
            }
            (this.$el as HTMLElement).style.cursor = 'inherit';
            this.tooltipPosition = undefined;
            this.hoverItem = undefined;
        },
        heatmap_node_tooltip(item: object) {
            return `<div style="text-align:left;">
                        Group: ${item[this.columnKey]}<br />
                        Module: ${item[this.rowKey]}<br />
                        Usage: ${item[this.valueKey].toExponential(3)}
                    </div>`;
        },
    },
});
</script>

<style scoped>
.clustered-heatmap-container {
    overflow: hidden;
}
</style>
