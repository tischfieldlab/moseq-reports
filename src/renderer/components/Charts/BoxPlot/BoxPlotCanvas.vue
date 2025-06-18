<template>
    <div :style="{width:'100%', height:'100%', 'overflow': 'hidden'}">
        <canvas
            v-dpi-adapt="{width: width, height: height}"
            v-show="has_data"
            ref='canvasEl'
            @mousemove="handleHover"
            @mouseleave="hoverItem = undefined"></canvas>

        <MessageBox :show="!has_data">{{noDataMessage}}</MessageBox>
        <ToolTip :position="tooltipPosition" :show="hoverItem !== undefined">
            <div style="text-align:left;" v-html="tooltip_text">
            </div>
        </ToolTip>
    </div>
</template>

<script setup lang='ts'>
import {BoxPlotBaseProps, BoxPlotBasePropsDefaults, useBoxPlotBase} from './BoxPlotBase';
import { GroupStats, DataPoint, LabelStats } from './BoxPlot.types';
import { sum } from 'd3-array';
import { throttle, debounce } from '@render/util/Events';
import {sample} from '@render/util/Array';
import ToolTip from '@render/components/Charts/ToolTip.vue';
import {useCanvas} from '@render/components/Charts/Canvas';
import MessageBox from '@render/components/Charts/CenteredMessage.vue';
import { onMounted, onUnmounted, nextTick, ref, watch, WatchHandle } from 'vue';




const props = withDefaults(defineProps<BoxPlotBaseProps>(), BoxPlotBasePropsDefaults);

const { points,
    groupedData,
    has_data,
    scale,
    fences,
    diamond,
    violinArea,
    violinLine,
    margin,
    origin,
    tooltip_text,
    tooltipPosition,
    hoverItem,
    actuallyShowPoints,
    is_outlier,
    halfBandwith,
    quaterBandwith,
    xAxisLabelYPos,
    innerHeight,
    innerWidth,
    rotate_labels,
} = useBoxPlotBase(props);

const emitLoadingOnUpdate = ref(false);

const to_watch = [
    points,
    groupedData,
    has_data,
    scale,
    fences,
    diamond,
    violinArea,
    violinLine,
    margin,
    origin,
    tooltip_text,
    tooltipPosition,
    hoverItem,
    actuallyShowPoints,
    halfBandwith,
    quaterBandwith,
    xAxisLabelYPos,
    innerHeight,
    innerWidth,
    rotate_labels,
];
const watchers: WatchHandle[] = [];

onMounted(() => {;

    Object.keys(props).forEach((key) => {
        watchers.push(
            watch(
                () => props[key],
                () => {
                    draw();
                },
                {deep: true}
            )
        );
    });
    to_watch.forEach((item) => {
        watchers.push(
            watch(
                () => item,
                () => {
                    draw();
                },
                {deep: true}
            )
        );
    });
    draw();
});

onUnmounted(() => {
    watchers.forEach((w) => {
        w();
    });
});

const label_stats = ref<LabelStats>({
    count: 0,
    total: 0,
    longest: 0,
});

const {canvas, vDpiAdapt} = useCanvas();

const draw = debounce(() => {
    //emitStartLoading();
    nextTick().then(() => {
        const ctx = canvas.value.cxt;
        if (ctx === null) {
            //emitFinishLoading();
            return; // bail out
        }
        ctx.save();
        // clear canvas
        ctx.clearRect(0, 0, props.width, props.height);

        ctx.translate(margin.value.left, margin.value.top);

        if (props.show_boxplot) {
            for (const node of groupedData.value) {
                drawBoxPlotNode(ctx, node);
            }
        }
        if (props.show_violinplot) {
            for (const node of groupedData.value) {
                drawViolinNode(ctx, node);
            }
        }
        if (actuallyShowPoints) {
            for (const node of points.value) {
                if (is_outlier(node)) {
                    drawOutlierPointNode(ctx, node);
                } else {
                    drawPointNode(ctx, node);
                }
            }
        }
        drawAxisX(ctx);
        drawAxisY(ctx);
        ctx.restore();
        //emitFinishLoading();
    });
}, 100);
const drawBoxPlotNode = (ctx: CanvasRenderingContext2D, node: GroupStats) => {
    const x = scale.value.x(node.group) as number;

    // Vertical midline
    ctx.beginPath();
    ctx.moveTo(x + halfBandwith.value,
                scale.value.y(fences.value.lower(node)));
    ctx.lineTo(x + halfBandwith.value,
                scale.value.y(fences.value.upper(node)));
    ctx.stroke();

    // the Box of the BoxPlot
    ctx.beginPath();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.rect(x,
                scale.value.y(node.q1),
                halfBandwith.value * 2,
                scale.value.y(node.q3) - scale.value.y(node.q1));

    ctx.fillStyle = scale.value.c(node.group);
    ctx.fill();
    ctx.stroke();

    // Horizontal Minimum line
    ctx.beginPath();
    ctx.moveTo(x + quaterBandwith.value,
                scale.value.y(fences.value.lower(node)));
    ctx.lineTo(x + (quaterBandwith.value * 3),
                scale.value.y(fences.value.lower(node)));
    ctx.stroke();

    // Horizontal Median line
    ctx.beginPath();
    ctx.moveTo(x, scale.value.y(node.q2));
    ctx.lineTo(x + (halfBandwith.value * 2), scale.value.y(node.q2));
    ctx.stroke();

    // Horizontal Maximum line
    ctx.beginPath();
    ctx.moveTo(x + quaterBandwith.value, scale.value.y(fences.value.upper(node)));
    ctx.lineTo(x + (quaterBandwith.value * 3), scale.value.y(fences.value.upper(node)));
    ctx.stroke();
}
const drawPointNode = (ctx: CanvasRenderingContext2D, node: DataPoint) => {
    ctx.beginPath();
    ctx.arc(scale.value.x(node.group) as number + node.jitter + halfBandwith.value,
            scale.value.y(node.value),
            props.point_size,
            0, 2 * Math.PI);
    ctx.fillStyle = scale.value.c(node.group);
    ctx.fill();
    ctx.stroke();
}
const drawOutlierPointNode = (ctx: CanvasRenderingContext2D, node: DataPoint) => {
    ctx.save();
    ctx.translate(scale.value.x(node.group) as number + node.jitter + halfBandwith.value, scale.value.y(node.value));
    ctx.beginPath();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.fillStyle = scale.value.c(node.group);
    const p = new Path2D(diamond.value() as string);
    ctx.stroke(p);
    ctx.fill(p);
    ctx.restore();
}
const drawViolinNode = (ctx: CanvasRenderingContext2D, node: GroupStats) => {
    ctx.save();
    ctx.translate(scale.value.x(node.group) as number, 0);
    ctx.beginPath();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 0;
    ctx.fillStyle = scale.value.c(node.group);
    const p = new Path2D(violinArea.value(node.kde) as string);
    // ctx.stroke(p);
    ctx.fill(p);
    ctx.restore();
}
const drawAxisX = (ctx: CanvasRenderingContext2D) => {
    ctx.beginPath();
    ctx.moveTo(scale.value.x.range()[0], scale.value.y.range()[0]);
    ctx.lineTo(scale.value.x.range()[1], scale.value.y.range()[0]);

    // iterate over our x domain values
    scale.value.x.domain().forEach((d) => {
        // tell canvas to draw lines at the bottom of our bars
        ctx.moveTo(scale.value.x(d) as number + halfBandwith.value,
                    innerHeight.value);
        ctx.lineTo(scale.value.x(d) as number + halfBandwith.value,
                    innerHeight.value + 6);
    });

    // set our stroke style to black & draw it
    ctx.strokeStyle = '#000';
    ctx.stroke();

    // apply x-axis labels
    if  (rotate_labels) {
        scale.value.x.domain().forEach((d, i) => {
            ctx.save();
            ctx.translate(scale.value.x(d) as number + halfBandwith.value, innerHeight.value + 6);
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

        scale.value.x.domain().forEach((d, i) => {
            ctx.fillText(d,
                        scale.value.x(d) as number + halfBandwith.value,
                        innerHeight.value + 6);
        });
    }

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'black';
    ctx.font = '13px Verdana';
    ctx.fillText(props.xAxisTitle, innerWidth.value / 2, innerHeight.value + xAxisLabelYPos.value);
    ctx.restore();
}
const drawAxisY = (ctx: CanvasRenderingContext2D) => {
    ctx.beginPath();

    ctx.moveTo(scale.value.x.range()[0], scale.value.y.range()[0]);
    ctx.lineTo(scale.value.x.range()[0], scale.value.y.range()[1]);

    // iterate over our x domain values
    scale.value.y.ticks().forEach((d) => {
        // tell canvas to draw lines at the bottom of our bars
        ctx.moveTo(0, scale.value.y(d));
        ctx.lineTo(-6, scale.value.y(d));
    });

    // set our stroke style to black & draw it
    ctx.strokeStyle = '#000';
    ctx.stroke();

    // apply y-axis labels
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'black';

    const tickFormat = scale.value.y.tickFormat(undefined, '.1e');
    scale.value.y.ticks().forEach((d, i) => {
        ctx.fillText(tickFormat(d), -9, scale.value.y(d));
    });

    ctx.save();
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '13px Verdana';
    ctx.fillText(props.yAxisTitle, -innerHeight.value / 2, -50);
    ctx.restore();
}
const compute_label_stats = (labels: string[]) => {
    const ctx = canvas.value.cxt;
    if (ctx !== null) {
        const widths = labels.map((l) => {
            return ctx.measureText(l).width;
        });
        label_stats.value = {
            count: labels.length,
            total: sum(widths),
            longest: Math.max(...widths),
        };
    } else {
        // if canvas is not available yet (i.e. before fully mounted)
        // then schedule the calculation for the next tick
        nextTick(() => compute_label_stats(labels));
        return;
    }
}
const handleHover = throttle((event: MouseEvent) => {
    // check points
    for (const node of points.value as DataPoint[]) {
        const cx = scale.value.x(node.group) as number + node.jitter + halfBandwith.value + margin.value.left;
        const cy = scale.value.y(node.value) + margin.value.top;
        if (PointInsideCircle(cx, cy, props.point_size, event.offsetX, event.offsetY)) {
            tooltipPosition.value = {
                x: event.clientX,
                y: event.clientY
            };
            hoverItem.value = node;
            return;
        }
    }

    // check boxplot boxes
    for (const node of groupedData.value as GroupStats[]) {
        const x1 = margin.value.left + (scale.value.x(node.group) as number);
        const y1 = margin.value.top + scale.value.y(node.q1);
        const x2 = margin.value.left + (scale.value.x(node.group) as number) + scale.value.x.bandwidth();
        const y2 = margin.value.top + scale.value.y(node.q3);

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
    tooltipPosition.value = {x: 0, y: 0};
    hoverItem.value = undefined;
}, 10);


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