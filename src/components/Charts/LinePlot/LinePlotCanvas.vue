<template>
<div>
    <canvas ref="canvas" v-show="has_data"
        v-dpiadapt="{width: width, height: height}"
        @click="handleClick"
        @mousemove="debouncedHover"
        @mouseleave="hoverItem = undefined">
    </canvas>
    <!--<MessageBox :show="!has_data">{{noDataMessage}}</MessageBox>-->
    <ToolTip :position="tooltipPosition" :show="hoverItem !== undefined">
        <div v-html="tooltip_text" style="text-align:left;"></div>
    </ToolTip>
</div>
</template>


<script lang="ts">
import mixins from 'vue-typed-mixins';
import Vue, { PropType } from 'vue'
import * as d3 from 'd3';
import { debounce, throttle } from '@/util/Events';
import ToolTip from '@/components/Charts/ToolTip.vue';
import MessageBox from '@/components/Charts/CenteredMessage.vue';
import LinePlotBase from './LinePlotBase.vue';
import CanvasMixin from '@/components/Charts/Canvas';



function default_tooltip_formatter(value: any, that) {
    return JSON.stringify(value, undefined, '\t');
}


export default mixins(LinePlotBase, CanvasMixin).extend({
    components: {
        ToolTip,
        MessageBox,
    },
    data() {
        return {
            debouncedHover: (event: MouseEvent) => {/**/},
        };
    },
    mounted() {
        this.debouncedDraw = debounce(this.draw, 50);
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
            const ctx = this.canvas.cxt;
            if (ctx === null) {
                return;
            }

            ctx.save();
            // clear canvas
            ctx.clearRect(0, 0, this.width, this.height);

            this.drawSeries(ctx);
            this.drawAxisX(ctx);
            this.drawAxisY(ctx);

            ctx.restore();
        },
        drawSeries(ctx: CanvasRenderingContext2D) {
            ctx.save();
            ctx.translate(this.margin.left, this.margin.top);
            for (const [g, sdata] of Object.entries(this.groupedData)) {
                this.drawSeriesLine(ctx, g, sdata);
                this.drawSeriesErrors(ctx, sdata);
                this.drawSeriesPoints(ctx, sdata);
            }
            ctx.restore();
        },
        drawSeriesLine(ctx: CanvasRenderingContext2D, g: string, sdata: object[]) {
            if (!this.showLines) {
                return;
            }
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = this.scale.c(g);
            ctx.lineWidth = this.lineWeight;
            ctx.stroke(new Path2D(this.seriesPath(sdata as any) as string));
            ctx.restore();
        },
        drawSeriesPoints(ctx: CanvasRenderingContext2D, sdata: object[]) {
            if (!this.showPoints) {
                return;
            }
            ctx.save();
            for (const node of sdata) {
                ctx.beginPath();
                ctx.arc(this.scale.x(node[this.varKey]),
                        this.scale.y(node[this.valueKey]),
                        this.pointSize,
                        0, 2 * Math.PI);
                ctx.fillStyle = this.scale.c(node[this.seriesKey]);
                ctx.fill();
                ctx.stroke();
            }
            ctx.restore();
        },
        drawSeriesErrors(ctx: CanvasRenderingContext2D, sdata: object[]) {
            if (!this.showError) {
                return;
            }
            ctx.save();
            const offset = this.scale.x.step() / 8;
            for (const node of sdata) {
                // vertical
                ctx.moveTo(this.scale.x(node[this.varKey]), this.scale.y(node[this.valueKey] - node[this.errorKey]));
                ctx.lineTo(this.scale.x(node[this.varKey]), this.scale.y(node[this.valueKey] + node[this.errorKey]));

                // upper fence
                ctx.moveTo(this.scale.x(node[this.varKey]) - offset, this.scale.y(node[this.valueKey] + node[this.errorKey]));
                ctx.lineTo(this.scale.x(node[this.varKey]) + offset, this.scale.y(node[this.valueKey] + node[this.errorKey]));

                // lower fence
                ctx.moveTo(this.scale.x(node[this.varKey]) - offset, this.scale.y(node[this.valueKey] - node[this.errorKey]));
                ctx.lineTo(this.scale.x(node[this.varKey]) + offset, this.scale.y(node[this.valueKey] - node[this.errorKey]));

                ctx.strokeStyle = this.scale.c(node[this.seriesKey]);
                ctx.lineWidth = this.lineWeight / 2;
                ctx.stroke();
            }
            ctx.restore();
        },
        drawAxisX(ctx: CanvasRenderingContext2D) {
            ctx.save();
            ctx.translate(this.margin.left, this.height - this.margin.bottom);
            ctx.beginPath();

            // main domain line
            ctx.moveTo(this.scale.x.range()[0], 0);
            ctx.lineTo(this.scale.x.range()[1], 0);

            // iterate over our x domain values
            this.scale.x.domain().forEach((d) => {
                // tell canvas to draw lines at the bottom of our bars
                ctx.moveTo(this.scale.x(d) + (this.scale.x.bandwidth() / 2), 0);
                ctx.lineTo(this.scale.x(d) + (this.scale.x.bandwidth() / 2), 6);
            });

            // set our stroke style to black & draw it
            ctx.strokeStyle = '#000';
            ctx.stroke();

            // apply x-axis labels
            if  (this.rotate_labels) {
                this.scale.x.domain().forEach((d) => {
                    ctx.save();
                    ctx.translate(this.scale.x(d) + (this.scale.x.bandwidth() / 2), 6);
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

                this.scale.x.domain().forEach((d) => {
                    ctx.fillText(d,
                                this.scale.x(d) + (this.scale.x.bandwidth() / 2),
                                6);
                });
            }

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'black';
            ctx.font = '13px Verdana';
            ctx.fillText(this.xAxisTitle, (this.width - this.margin.right) / 2, this.margin.bottom / 2);
            ctx.restore();

            ctx.restore();
        },
        drawAxisY(ctx: CanvasRenderingContext2D) {
            ctx.save();
            ctx.translate(this.margin.left, this.margin.top);

            // main domain line
            ctx.strokeStyle = '#000';
            ctx.beginPath();
            ctx.moveTo(0, this.scale.y.range()[0]);
            ctx.lineTo(0, this.scale.y.range()[1]);
            ctx.stroke();

            // apply y-axis labels and ticks
            this.scale.y.ticks().forEach((d) => {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 1;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'black';
                ctx.font = '8px Verdana,Arial,sans-serif';
                ctx.beginPath();
                ctx.moveTo(-6, this.scale.y(d));
                ctx.lineTo(0, this.scale.y(d));
                ctx.stroke();
                ctx.textAlign = 'right';
                ctx.fillText(d, -9, this.scale.y(d));
            });

            ctx.save();
            ctx.rotate(-Math.PI / 2);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = '13px Verdana';
            ctx.fillText(this.yAxisTitle, -(this.height - this.margin.bottom) / 2, -50);
            ctx.restore();

            ctx.restore();
        },
        handleClick(event: MouseEvent) {
            for (const node of this.data as object[]) {
                const x1 = this.margin.left + this.scale.x(node[this.varKey]) - this.pointSize;
                const y1 = this.margin.top + this.scale.y(node[this.valueKey]) - this.pointSize;
                const x2 = this.margin.left + this.scale.x(node[this.varKey]) + this.pointSize;
                const y2 = this.margin.top + this.scale.y(node[this.valueKey]) + this.pointSize;

                if (event.offsetX > x1 && event.offsetX <= x2
                 && event.offsetY > y1 && event.offsetY <= y2) {
                    this.$emit('lineplot-click', {
                        e: event,
                        series: node[this.seriesKey],
                        var: node[this.varKey],
                        value: node[this.valueKey],
                    });
                    return;
                }
            }
        },
        handleHover(event: MouseEvent) {
            for (const node of this.data as object[]) {
                const x1 = this.margin.left + this.scale.x(node[this.varKey]) - this.pointSize;
                const y1 = this.margin.top + this.scale.y(node[this.valueKey]) - this.pointSize;
                const x2 = this.margin.left + this.scale.x(node[this.varKey]) + this.pointSize;
                const y2 = this.margin.top + this.scale.y(node[this.valueKey]) + this.pointSize;

                if (event.offsetX > x1 && event.offsetX <= x2
                 && event.offsetY > y1 && event.offsetY <= y2) {
                    this.tooltipPosition = {
                        x: event.clientX,
                        y: event.clientY
                    };
                    this.hoverItem = node;
                    (this.$el as HTMLElement).style.cursor = this.hoverCursor;
                    return;
                }
            }
            (this.$el as HTMLElement).style.cursor = 'inherit';
            this.tooltipPosition = undefined;
            this.hoverItem = undefined;
        },
    },
    directives: {
        axis(el, binding) {
            const axis = binding.arg;
            if (axis !== undefined) {
                const axisMethod = { x: 'axisBottom', y: 'axisLeft' }[axis] as string;
                const methodArg = binding.value[axis];
                d3.select(el).call(d3[axisMethod](methodArg));
            }
        },
    },
});
</script>


<style scoped>
svg >>> g.x-axis text.label,
svg >>> g.y-axis text.label {
    text-anchor:middle;
    fill:#000;
    font-family: Verdana,Arial,sans-serif;
    font-size: 12px;
}
svg >>> g.x-axis.rotate g.tick text {
    transform: translate(-10px,0px) rotate(-45deg);
    text-anchor: end;
}
svg >>> line,
svg >>> rect {
    shape-rendering: crispEdges;
}
svg >>> circle,
svg >>> path {
    shape-rendering: geometricPrecision;
}
</style>