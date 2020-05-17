<template>
    <canvas ref='canvas' :width='width' :height='height'></canvas>
</template>

<script lang='ts'>
import Vue from 'vue';
import BoxPlotBase from './BoxPlotBase.vue';
import { GroupStats, DataPoint } from './BoxPlot.types';
import { sum } from 'd3-array';
import { debounce } from 'ts-debounce';
import mixins from 'vue-typed-mixins';
import {sample} from '@/util/Array';


export default mixins(BoxPlotBase).extend({
    data() {
        return {
            vueCanvas: null as CanvasRenderingContext2D | null,
            debouncedDraw: () => {/**/},
        };
    },
    mounted() {
        const c = this.$refs.canvas as HTMLCanvasElement;
        this.vueCanvas = c.getContext('2d');
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
                if (this.vueCanvas === null) {
                    return; // bail out
                }
                this.vueCanvas.save();
                // clear canvas
                this.vueCanvas.clearRect(0, 0, this.width, this.height);

                this.vueCanvas.translate(this.margin.left, this.margin.top);

                if (this.show_boxplot) {
                    for (const node of this.groupedData) {
                        this.drawBoxPlotNode(this.vueCanvas, node);
                    }
                }
                if (this.show_violinplot) {
                    for (const node of this.groupedData) {
                        this.drawViolinNode(this.vueCanvas, node);
                    }
                }
                if (this.actuallyShowPoints) {
                    for (const node of this.points) {
                        if (this.is_outlier(node)) {
                            this.drawOutlierPointNode(this.vueCanvas, node);
                        } else {
                            this.drawPointNode(this.vueCanvas, node);
                        }
                    }
                }
                this.drawAxisX(this.vueCanvas);
                this.drawAxisY(this.vueCanvas);
                this.vueCanvas.restore();
                this.$emit('finish-loading');
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
            // ctx.stroke(p);
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

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'black';
            ctx.fillText(this.xAxisTitle, this.innerWidth / 2, this.innerHeight + this.xAxisLabelYPos);
        },
        drawAxisY(ctx: CanvasRenderingContext2D) {
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

            this.scale.y.ticks().forEach((d, i) => {
                ctx.fillText(d, -9, this.scale.y(d));
            });

            ctx.save();
            ctx.rotate(-Math.PI / 2);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.yAxisTitle, -this.innerHeight / 2, -45);
            ctx.restore();
        },
        compute_label_stats(labels: string[]) {
            if (this.vueCanvas !== null) {
                const ctx = this.vueCanvas;
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
    },
});
</script>
