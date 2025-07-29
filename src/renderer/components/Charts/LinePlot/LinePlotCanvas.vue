<template>
<div>
    <canvas v-show="has_data"
        v-dpi-adapt="{width: width, height: height}"
        @click="handleClick"
        @mousemove="handleHover"
        @mouseleave="hoverItem = undefined">
    </canvas>
    <!--<MessageBox :show="!has_data">{{noDataMessage}}</MessageBox>-->
    <ToolTip :position="tooltipPosition" :show="hoverItem !== undefined">
        <div v-html="tooltip_text" style="text-align:left;"></div>
    </ToolTip>
</div>
</template>


<script setup lang="ts">
import { debounce, throttle } from '@render/util/Events';
import ToolTip from '@render/components/Charts/ToolTip.vue';
import MessageBox from '@render/components/Charts/CenteredMessage.vue';
import { LinePlotBaseEmits, LinePlotBaseProps, LinePlotBasePropsDefaults, useLinePlotBase } from './LinePlotBase';
import { useCanvas } from '../Canvas';
import { onMounted, watchPostEffect } from 'vue';



function default_tooltip_formatter(value: any, that) {
    return JSON.stringify(value, undefined, '\t');
}


const props = withDefaults(defineProps<LinePlotBaseProps>(), LinePlotBasePropsDefaults);
const emit = defineEmits<LinePlotBaseEmits>();
const {tooltipPosition, hoverItem, tooltip_text, scale, innerHeight, innerWidth, seriesPath, margin, rotate_labels, xAxisLabelYPos, origin, has_data, groupedData, isPointValid} = useLinePlotBase(props);

const {canvas, vDpiAdapt} = useCanvas();


onMounted(() => {
    watchPostEffect(draw);
});

function draw() {
    const ctx = canvas.value.cxt;
    if (ctx === null) {
        return;
    }

    ctx.save();
    // clear canvas
    ctx.clearRect(0, 0, props.width, props.height);

    drawSeries(ctx);
    drawAxisX(ctx);
    drawAxisY(ctx);

    ctx.restore();
}
function drawSeries(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(margin.left, margin.top);
    for (const [g, sdata] of Object.entries(groupedData.value)) {
        drawSeriesLine(ctx, g, sdata);
        drawSeriesErrors(ctx, sdata);
        drawSeriesPoints(ctx, sdata);
    }
    ctx.restore();
}
function drawSeriesLine(ctx: CanvasRenderingContext2D, g: string, sdata: object[]) {
    if (!props.showLines) {
        return;
    }
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = scale.value.c(g) as string;
    ctx.lineWidth = props.lineWeight;
    ctx.stroke(new Path2D(seriesPath.value(sdata as any) as string));
    ctx.restore();
}
function drawSeriesPoints(ctx: CanvasRenderingContext2D, sdata: object[]) {
    if (!props.showPoints) {
        return;
    }
    ctx.save();
    for (const node of sdata) {
        ctx.beginPath();
        ctx.arc(scale.value.x(node[props.varKey]) as number,
                scale.value.y(node[props.valueKey]),
                props.pointSize,
                0, 2 * Math.PI);
        ctx.fillStyle = scale.value.c(node[props.seriesKey]) as string;
        ctx.fill();
        ctx.stroke();
    }
    ctx.restore();
}
function drawSeriesErrors(ctx: CanvasRenderingContext2D, sdata: object[]) {
    if (!props.showError) {
        return;
    }
    ctx.save();
    const offset = scale.value.x.step() / 8;
    for (const node of sdata) {
        // vertical
        ctx.moveTo(scale.value.x(node[props.varKey]) as number, scale.value.y(node[props.valueKey] - node[props.errorKey]));
        ctx.lineTo(scale.value.x(node[props.varKey]) as number, scale.value.y(node[props.valueKey] + node[props.errorKey]));

        // upper fence
        ctx.moveTo(scale.value.x(node[props.varKey]) as number - offset, scale.value.y(node[props.valueKey] + node[props.errorKey]));
        ctx.lineTo(scale.value.x(node[props.varKey]) as number + offset, scale.value.y(node[props.valueKey] + node[props.errorKey]));

        // lower fence
        ctx.moveTo(scale.value.x(node[props.varKey]) as number - offset, scale.value.y(node[props.valueKey] - node[props.errorKey]));
        ctx.lineTo(scale.value.x(node[props.varKey]) as number + offset, scale.value.y(node[props.valueKey] - node[props.errorKey]));

        ctx.strokeStyle = scale.value.c(node[props.seriesKey]) as string;
        ctx.lineWidth = props.lineWeight / 2;
        ctx.stroke();
    }
    ctx.restore();
}
function drawAxisX(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(margin.left, props.height - margin.bottom);
    ctx.beginPath();

    // main domain line
    ctx.moveTo(scale.value.x.range()[0], 0);
    ctx.lineTo(scale.value.x.range()[1], 0);

    // iterate over our x domain values
    scale.value.x.domain().forEach((d) => {
        // tell canvas to draw lines at the bottom of our bars
        ctx.moveTo(scale.value.x(d) as number + (scale.value.x.bandwidth() / 2), 0);
        ctx.lineTo(scale.value.x(d) as number + (scale.value.x.bandwidth() / 2), 6);
    });

    // set our stroke style to black & draw it
    ctx.strokeStyle = '#000';
    ctx.stroke();

    // apply x-axis labels
    if  (rotate_labels.value) {
        scale.value.x.domain().forEach((d) => {
            ctx.save();
            ctx.translate(scale.value.x(d) as number + (scale.value.x.bandwidth() / 2), 6);
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

        scale.value.x.domain().forEach((d) => {
            ctx.fillText(d,
                        scale.value.x(d) as number + (scale.value.x.bandwidth() / 2),
                        6);
        });
    }

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'black';
    ctx.font = '13px Verdana';
    ctx.fillText(props.xAxisTitle, (props.width - margin.right - margin.left) / 2, xAxisLabelYPos.value);
    ctx.restore();

    ctx.restore();
}
function drawAxisY(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(margin.left, margin.top);

    // main domain line
    ctx.strokeStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(0, scale.value.y.range()[0]);
    ctx.lineTo(0, scale.value.y.range()[1]);
    ctx.stroke();

    // apply y-axis labels and ticks
    const tick_formatter = scale.value.y.tickFormat();
    scale.value.y.ticks().forEach((d) => {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'black';
        ctx.font = '8px Verdana,Arial,sans-serif';
        ctx.beginPath();
        ctx.moveTo(-6, scale.value.y(d));
        ctx.lineTo(0, scale.value.y(d));
        ctx.stroke();
        ctx.textAlign = 'right';
        ctx.fillText(tick_formatter(d), -9, scale.value.y(d));
    });

    ctx.save();
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '13px Verdana';
    ctx.fillText(props.yAxisTitle, -(props.height - margin.bottom) / 2, -50);
    ctx.restore();

    ctx.restore();
}
function handleClick(event: MouseEvent) {
    for (const node of props.data as object[]) {
        const x1 = margin.left + (scale.value.x(node[props.varKey]) as number) - props.pointSize;
        const y1 = margin.top + scale.value.y(node[props.valueKey]) - props.pointSize;
        const x2 = margin.left + (scale.value.x(node[props.varKey]) as number) + props.pointSize;
        const y2 = margin.top + scale.value.y(node[props.valueKey]) + props.pointSize;

        if (event.offsetX > x1 && event.offsetX <= x2
            && event.offsetY > y1 && event.offsetY <= y2) {
            // Fire when line plot is clicked if offset is within range
            // @arg An event, the series key, var key, and value key of the line plot
            emit('lineplot-click', {
                e: event,
                series: node[props.seriesKey],
                var: node[props.varKey],
                value: node[props.valueKey],
            });
            return;
        }
    }
}
const handleHover = throttle((event: MouseEvent) => {
    for (const node of props.data as object[]) {
        const x1 = margin.left + (scale.value.x(node[props.varKey]) as number) - props.pointSize;
        const y1 = margin.top + scale.value.y(node[props.valueKey]) - props.pointSize;
        const x2 = margin.left + (scale.value.x(node[props.varKey]) as number) + props.pointSize;
        const y2 = margin.top + scale.value.y(node[props.valueKey]) + props.pointSize;

        if (event.offsetX > x1 && event.offsetX <= x2
            && event.offsetY > y1 && event.offsetY <= y2) {
            tooltipPosition.value = {
                x: event.clientX,
                y: event.clientY
            };
            hoverItem.value = node;
            return;
        }
    }
    tooltipPosition.value = undefined;
    hoverItem.value = undefined;
}, 10);



/*
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
*/
</script>


<style scoped>
svg :deep(g.x-axis text.label),
svg :deep(g.y-axis text.label) {
    text-anchor:middle;
    fill:#000;
    font-family: Verdana,Arial,sans-serif;
    font-size: 12px;
}
svg :deep(g.x-axis.rotate g.tick text) {
    transform: translate(-10px,0px) rotate(-45deg);
    text-anchor: end;
}
svg :deep(line),
svg :deep(rect) {
    shape-rendering: crispEdges;
}
svg :deep(circle),
svg :deep(path) {
    shape-rendering: geometricPrecision;
}
</style>