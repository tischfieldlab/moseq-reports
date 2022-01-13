<template>
    <div :style="{width:'100%', height:'100%', 'overflow': 'hidden'}">
        <canvas
            v-dpiadapt="{width: width, height: height}"
            v-show="has_data"
            ref='canvas'
            class="canvas-axis-labels"
            @mousemove="debouncedHover"
            @mouseleave="hoverItem = undefined"></canvas>

        <MessageBox :show="!has_data">{{noDataMessage}}</MessageBox>
        <ToolTip :position="tooltipPosition" :show="hoverItem !== undefined">
            <div style="text-align:left;" v-html="tooltip_text">
            </div>
        </ToolTip>
    </div>
</template>

<script lang='ts'>
import Vue from 'vue';
import BoxPlotBase from './BoxPlotBase.vue';
import { GroupStats, DataPoint } from './BoxPlot.types';
import { sum } from 'd3-array';
import { throttle, debounce } from '@/util/Events';
import mixins from 'vue-typed-mixins';
import {sample} from '@/util/Array';
import ToolTip from '@/components/Charts/ToolTip.vue';
import CanvasMixin from '@/components/Charts/Canvas';
import MessageBox from '@/components/Charts/CenteredMessage.vue';


export default mixins(BoxPlotBase, CanvasMixin).extend({
    components: {
        ToolTip,
        MessageBox,
    },
    data() {
        return {
            emitLoadingOnUpdate: false,
        };
    },
    mounted() {
        this.debouncedDraw = debounce(this.draw, 100);
        this.debouncedHover = throttle(this.handleHover, 10);

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
            this.emitStartLoading();
            this.$forceNextTick().then(() => {
                const ctx = this.canvas.cxt;
                if (ctx === null) {
                    this.emitFinishLoading();
                    return; // bail out
                }
                ctx.save();
                // clear canvas
                ctx.clearRect(0, 0, this.width, this.height);

                ctx.translate(this.margin.left, this.margin.top);

                if (this.show_boxplot) {
                    for (const node of this.groupedData) {
                        this.drawBoxPlotNode(ctx, node);
                    }
                }
                if (this.show_violinplot) {
                    for (const node of this.groupedData) {
                        this.drawViolinNode(ctx, node);
                    }
                }
                if (this.actuallyShowPoints) {
                    for (const node of this.points) {
                        if (this.is_outlier(node)) {
                            this.drawOutlierPointNode(ctx, node);
                        } else {
                            this.drawPointNode(ctx, node);
                        }
                    }
                }
                this.drawAxisX(ctx);
                this.drawAxisY(ctx);
                ctx.restore();
                this.emitFinishLoading();
            });
        },
        drawBoxPlotNode(ctx: CanvasRenderingContext2D, node: GroupStats) {
            // Vertical midline
            ctx.beginPath();
            ctx.moveTo(this.scale.x(node.group) + this.halfBandwith,
                       this.scale.y(this.fences.lower(node)));
            ctx.lineTo(this.scale.x(node.group) + this.halfBandwith,
                       this.scale.y(this.fences.upper(node)));
            ctx.stroke();

            // the Box of the BoxPlot
            ctx.beginPath();
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.rect(this.scale.x(node.group),
                     this.scale.y(node.q1),
                     this.halfBandwith * 2,
                     this.scale.y(node.q3) - this.scale.y(node.q1));

            ctx.fillStyle = this.scale.c(node.group);
            ctx.fill();
            ctx.stroke();

            // Horizontal Minimum line
            ctx.beginPath();
            ctx.moveTo(this.scale.x(node.group) + this.quaterBandwith,
                       this.scale.y(this.fences.lower(node)));
            ctx.lineTo(this.scale.x(node.group) + (this.quaterBandwith * 3),
                       this.scale.y(this.fences.lower(node)));
            ctx.stroke();

            // Horizontal Median line
            ctx.beginPath();
            ctx.moveTo(this.scale.x(node.group),
                       this.scale.y(node.q2));
            ctx.lineTo(this.scale.x(node.group) + (this.halfBandwith * 2),
                       this.scale.y(node.q2));
            ctx.stroke();

            // Horizontal Maximum line
            ctx.beginPath();
            ctx.moveTo(this.scale.x(node.group) + this.quaterBandwith,
                       this.scale.y(this.fences.upper(node)));
            ctx.lineTo(this.scale.x(node.group) + (this.quaterBandwith * 3),
                       this.scale.y(this.fences.upper(node)));
            ctx.stroke();
        },
        drawPointNode(ctx: CanvasRenderingContext2D, node: DataPoint) {
            ctx.beginPath();
            ctx.arc(this.scale.x(node.group) + node.jitter + this.halfBandwith,
                    this.scale.y(node.value),
                    this.point_size,
                    0, 2 * Math.PI);
            ctx.fillStyle = this.scale.c(node.group);
            ctx.fill();
            ctx.stroke();
        },
        drawOutlierPointNode(ctx: CanvasRenderingContext2D, node: DataPoint) {
            ctx.save();
            ctx.translate(this.scale.x(node.group) + node.jitter + this.halfBandwith, this.scale.y(node.value));
            ctx.beginPath();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.fillStyle = this.scale.c(node.group);
            const p = new Path2D(this.diamond());
            ctx.stroke(p);
            ctx.fill(p);
            ctx.restore();
        },
        drawViolinNode(ctx: CanvasRenderingContext2D, node: GroupStats) {
            ctx.save();
            ctx.translate(this.scale.x(node.group), 0);
            ctx.beginPath();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 0;
            ctx.fillStyle = this.scale.c(node.group);
            const p = new Path2D(this.violinArea(node.kde));
            ctx.stroke(p);
            ctx.fill(p);
            ctx.restore();
        },
        drawAxisX(ctx: CanvasRenderingContext2D) {
            ctx.beginPath();
            ctx.moveTo(this.scale.x.range()[0], this.scale.y.range()[0]);
            ctx.lineTo(this.scale.x.range()[1], this.scale.y.range()[0]);

            // iterate over our x domain values
            this.scale.x.domain().forEach((d) => {
                // tell canvas to draw lines at the bottom of our bars
                ctx.moveTo(this.scale.x(d) + this.halfBandwith,
                           this.innerHeight);
                ctx.lineTo(this.scale.x(d) + this.halfBandwith,
                           this.innerHeight + 6);
            });

            // set our stroke style to black & draw it
            ctx.strokeStyle = '#000';
            ctx.stroke();

            // apply x-axis labels
            if  (this.rotate_labels) {
                this.scale.x.domain().forEach((d, i) => {
                    ctx.save();
                    ctx.translate(this.scale.x(d) + this.halfBandwith, this.innerHeight + 6);
                    ctx.rotate(-Math.PI / 4);
                    ctx.textAlign = 'right';
                    ctx.textBaseline = 'top';
                    ctx.fillStyle = 'black';
                    ctx.fillText(d, 0, 0);
                    ctx.restore();
                });
            } else {
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillStyle = 'black';

                this.scale.x.domain().forEach((d, i) => {
                    ctx.fillText(d,
                                this.scale.x(d) + this.halfBandwith,
                                this.innerHeight + 6);
                });
            }

            const element = document.getElementsByClassName("canvas-widget")[0];
            const style = window.getComputedStyle(element);

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'black';
            ctx.font = style.font;
            ctx.fillText(this.xAxisTitle, this.innerWidth / 2, this.innerHeight + this.xAxisLabelYPos);
            ctx.restore();
        },
        drawAxisY(ctx: CanvasRenderingContext2D) {
            const element = document.getElementsByClassName("canvas-widget")[0];
            const style = window.getComputedStyle(element);
            ctx.beginPath();

            ctx.moveTo(this.scale.x.range()[0], this.scale.y.range()[0]);
            ctx.lineTo(this.scale.x.range()[0], this.scale.y.range()[1]);

            // iterate over our x domain values
            this.scale.y.ticks().forEach((d) => {
                // tell canvas to draw lines at the bottom of our bars
                ctx.moveTo(0, this.scale.y(d));
                ctx.lineTo(-6, this.scale.y(d));
            });

            // set our stroke style to black & draw it
            ctx.strokeStyle = '#000';
            ctx.stroke();

            // apply y-axis labels
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'black';

            const tickFormat = this.scale.y.tickFormat(undefined, '.1e');
            this.scale.y.ticks().forEach((d, i) => {
                ctx.fillText(tickFormat(d), -9, this.scale.y(d));
            });

            ctx.save();
            ctx.rotate(-Math.PI / 2);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = style.font;

            ctx.fillText(this.yAxisTitle, -this.innerHeight / 2, -50);
            ctx.restore();
        },
        compute_label_stats(labels: string[]) {
            const ctx = this.canvas.cxt;
            if (ctx !== null) {
                const widths = labels.map((l) => {
                    return ctx.measureText(l).width;
                });
                this.label_stats = {
                    count: labels.length,
                    total: sum(widths),
                    longest: Math.max(...widths),
                };
            } else {
                // if canvas is not available yet (i.e. before fully mounted)
                // then schedule the calculation for the next tick
                this.$nextTick(() => this.compute_label_stats(labels));
                return;
            }
        },
        handleHover(event: MouseEvent) {
            // check points
            for (const node of this.points as DataPoint[]) {
                const cx = this.scale.x(node.group) + node.jitter + this.halfBandwith + this.margin.left;
                const cy = this.scale.y(node.value) + this.margin.top;
                if (PointInsideCircle(cx, cy, this.point_size, event.offsetX, event.offsetY)) {
                    this.tooltipPosition = {
                        x: event.clientX,
                        y: event.clientY
                    };
                    this.hoverItem = node;
                    return;
                }
            }

            // check boxplot boxes
            for (const node of this.groupedData as GroupStats[]) {
                const x1 = this.margin.left + this.scale.x(node.group);
                const y1 = this.margin.top + this.scale.y(node.q1);
                const x2 = this.margin.left + this.scale.x(node.group) + this.scale.x.bandwidth();
                const y2 = this.margin.top + this.scale.y(node.q3);

                if (event.offsetX > x1 && event.offsetX <= x2
                 && event.offsetY > y1 && event.offsetY <= y2) {
                    this.tooltipPosition = {
                        x: event.clientX,
                        y: event.clientY
                    };
                    this.hoverItem = node;
                    return;
                }
            }
            this.tooltipPosition = undefined;
            this.hoverItem = undefined;
        },
    },
});

function PointInsideCircle(cx, cy, r, qx, qy) {
    return Math.sqrt((cx - qx)**2 + (cy - qy)**2) < r;
}
</script>

<style scoped>
.no-data .card {
    width: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
</style>
