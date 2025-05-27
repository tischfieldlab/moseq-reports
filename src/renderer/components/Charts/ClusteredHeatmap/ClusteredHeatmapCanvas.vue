<template>
    <div ref="root" class="clustered-heatmap-container">
        <canvas ref="canvas" v-show="has_data"
            v-dpi-adapt="{width: width, height: height}"
            @click="handleHeatmapClick"
            @mousemove="handleHeatmapHover"
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


<script setup lang="ts">
import {onMounted, onUnmounted, useTemplateRef, watch, nextTick} from 'vue';
import { sum } from 'd3-array';
import ColorScaleLegend from '@render/components/Charts/Colors/ColorScaleLegendCanvas.vue';
import ToolTip from '@render/components/Charts/ToolTip.vue';
import MessageBox from '@render/components/Charts/CenteredMessage.vue';
import { ClusteredHeatmapBaseEmits, ClusteredHeatmapBaseOverrides, ClusteredHeatmapBaseProps, ClusteredHeatmapBasePropsDefaults, useClusteredHeatmapBase } from './ClusteredHeatmapBase';
import { debounce, throttle } from '@render/util/Events';
import { useCanvas } from '../Canvas';
import { watchEffect } from 'vue';


const overrides: ClusteredHeatmapBaseOverrides = {
    showSelectedRow: (id: number) => {
        // do nothing?
    },
    showSelectedCol: (id: number) => {
        // do nothing?
    },
    compute_label_stats: (labels: string[]) => {
        const cxt = canvas.value.cxt;
        if (cxt !== null) {
            const widths = labels.map((l) => {
                return cxt.measureText(l).width;
            });
            label_stats.value = {
                count: labels.length,
                total: sum(widths),
                longest: Math.max(...widths),
            };
            return;
        }
        // if canvas is not available yet (i.e. before fully mounted)
        // then schedule the calculation for the next tick
        nextTick(() => overrides.compute_label_stats(labels));
        return;
    }
};


const {canvas, vDpiAdapt} = useCanvas();
const legend = useTemplateRef<InstanceType<typeof ColorScaleLegend>>('legend');
const root = useTemplateRef('root');

const props = withDefaults(defineProps<ClusteredHeatmapBaseProps>(), ClusteredHeatmapBasePropsDefaults());
const emit = defineEmits<ClusteredHeatmapBaseEmits>();
const { dims, scale, has_data, tooltip_text, label_stats, tooltipPosition, hoverItem, isColumnsHClustered, isRowsHClustered, rowLinks, columnLinks, elbowH, elbowV, rotate_labels, shouldHideLabel } = useClusteredHeatmapBase(props, emit, overrides);

const watchers: (() => void)[] = [];

/*
onMounted(() => {

    Object.keys(props).forEach((key) => {
        watchers.push(watch(() => props[key], () => {
            draw();
        }));
    });
    /*Object.keys(this.$data).forEach((key) => {
        watchers.push(watch(() => key, () => {
            draw();
        }));
    });*//*
    draw();
});

onUnmounted(() => {
    watchers.forEach((unwatch) => unwatch());
});*/

onMounted(() => {
    watchEffect(draw);
});


const draw = debounce(() => {
    console.debug('Drawing clustered heatmap canvas');
    const cxt = canvas.value.cxt;
    if (cxt === null) {
        return;
    }

    cxt.save();
    // clear canvas
    cxt.clearRect(0, 0, props.width, dims.value.legend.y);

    drawHeatmapCells(cxt);
    drawRowDendrogram(cxt);
    drawColumnDendrogram(cxt);
    drawAxisX(cxt);
    drawAxisY(cxt);

    cxt.restore();
    if (legend.value) {
        legend.value.$forceUpdate();
    }
}, 50);


function drawHeatmapCells(cxt: CanvasRenderingContext2D) {
    cxt.save();
    cxt.translate(dims.value.heatmap.x, dims.value.heatmap.y);
    for (const node of props.data as object[]) {
        cxt.beginPath();
        cxt.rect(scale.value.x(node[props.columnKey].toString()),
                scale.value.y(node[props.rowKey].toString()),
                scale.value.x.bandwidth(),
                scale.value.y.bandwidth());
        cxt.fillStyle = scale.value.z(node[props.valueKey]);
        cxt.strokeStyle = scale.value.z(node[props.valueKey]);
        cxt.fill();
        cxt.stroke();
    }
    cxt.restore();
}
function drawRowDendrogram(cxt: CanvasRenderingContext2D) {
    if (!isRowsHClustered.value) {
        return;
    }
    cxt.save();
    cxt.translate(dims.value.rtree.x, dims.value.rtree.y);
    for (const link of rowLinks.value) {
        cxt.beginPath();
        cxt.strokeStyle = '#aaa';
        cxt.lineWidth = 1.5;
        const p = new Path2D(elbowH(link));
        cxt.stroke(p);
    }
    cxt.restore();
}
function drawColumnDendrogram(cxt: CanvasRenderingContext2D) {
    if (!isColumnsHClustered.value) {
        return;
    }
    cxt.save();
    cxt.translate(dims.value.ctree.x, dims.value.ctree.y);
    for (const link of columnLinks.value) {
        cxt.beginPath();
        cxt.strokeStyle = '#aaa';
        cxt.lineWidth = 1.5;
        const p = new Path2D(elbowV(link));
        cxt.stroke(p);
    }
    cxt.restore();
}
function drawAxisX(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(dims.value.xaxis.x, dims.value.xaxis.y);

    // Draw x-axis labels and ticks
    scale.value.x.domain().forEach((d) => {
        if (!shouldHideLabel(d)) {
            const isSelected = (props.selectedCol && props.selectedCol.toString() === d.toString())

            // Draw Tick
            ctx.save();
            ctx.strokeStyle = '#000';
            let yTickOffset: number;
            if (isSelected) {
                ctx.lineWidth = 2;
                yTickOffset = 18;
            } else {
                ctx.lineWidth = 1;
                yTickOffset = 6;
            }
            ctx.beginPath();
            ctx.moveTo(scale.value.x(d) + (scale.value.x.bandwidth() / 2), 0);
            ctx.lineTo(scale.value.x(d) + (scale.value.x.bandwidth() / 2), yTickOffset);
            ctx.stroke();
            ctx.restore();


            // Draw Label
            ctx.save();
            ctx.textBaseline = 'top';
            ctx.fillStyle = scale.value.clc(d);

            if (isSelected) {
                ctx.font = 'bold 16px Verdana,Arial,sans-serif';
            } else {
                ctx.font = '8px Verdana,Arial,sans-serif';
            }
            ctx.translate(scale.value.x(d) + (scale.value.x.bandwidth() / 2), yTickOffset + 2);

            if (rotate_labels.value) {
                ctx.textAlign = 'right';
                ctx.rotate(-Math.PI / 4);
            } else {
                ctx.textAlign = 'center';
            }

            ctx.fillText(d, 0, 0);
            ctx.restore();
        }
    });


    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'black';
    ctx.font = '13px Verdana';
    ctx.fillText(props.xAxisTitle as string, dims.value.xaxis.w / 2, dims.value.xaxis.ly);
    ctx.restore();

    ctx.restore();
}
function drawAxisY(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(dims.value.yaxis.x, dims.value.yaxis.y);

    // Draw y-axis labels and ticks
    scale.value.y.domain().forEach((d) => {
        if (!shouldHideLabel(d)) {
            const isSelected = (props.selectedRow && props.selectedRow.toString() === d.toString())

            // Draw tick
            ctx.save();
            ctx.strokeStyle = '#000';
            let xTickOffset: number;
            if (isSelected) {
                ctx.lineWidth = 2;
                xTickOffset = 18;
            } else {
                ctx.lineWidth = 1;
                xTickOffset = 6;
            }
            ctx.beginPath();
            ctx.moveTo(0, scale.value.y(d) + (scale.value.y.bandwidth() / 2));
            ctx.lineTo(xTickOffset, scale.value.y(d) + (scale.value.y.bandwidth() / 2));
            ctx.stroke();
            ctx.restore();


            // Draw Label
            ctx.save();
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = scale.value.rlc(d);
            if (isSelected) {
                ctx.font = 'bold 16px Verdana,Arial,sans-serif';
            } else {
                ctx.font = '8px Verdana,Arial,sans-serif';
            }
            ctx.fillText(d, xTickOffset + 2, scale.value.y(d) + (scale.value.y.bandwidth() / 2));
            ctx.restore();
        }
    });

    ctx.save();
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '13px Verdana';
    ctx.fillText(props.yAxisTitle as string, -dims.value.yaxis.h / 2, 50);
    ctx.restore();

    ctx.restore();
}

function handleHeatmapClick(event: MouseEvent) {
    for (const node of props.data as object[]) {
        const x1 = dims.value.heatmap.x + scale.value.x(node[props.columnKey].toString());
        const y1 = dims.value.heatmap.y + scale.value.y(node[props.rowKey].toString());
        const x2 = dims.value.heatmap.x + scale.value.x(node[props.columnKey].toString()) + scale.value.x.bandwidth();
        const y2 = dims.value.heatmap.y + scale.value.y(node[props.rowKey].toString()) + scale.value.y.bandwidth();

        if (event.offsetX > x1 && event.offsetX <= x2
            && event.offsetY > y1 && event.offsetY <= y2) {
            // Fire when heatmap is clicked if offset is within range
            // @arg An event, the row key, column key, and value key of the heatmap
            emit('heatmap-click', {
                e: event,
                row: node[props.rowKey],
                col: node[props.columnKey],
                value: node[props.valueKey],
            });
            return;
        }
    }
}
const handleHeatmapHover = throttle((event: MouseEvent) => {
    for (const node of props.data as object[]) {
        const x1 = dims.value.heatmap.x + scale.value.x(node[props.columnKey].toString());
        const y1 = dims.value.heatmap.y + scale.value.y(node[props.rowKey].toString());
        const x2 = dims.value.heatmap.x + scale.value.x(node[props.columnKey].toString()) + scale.value.x.bandwidth();
        const y2 = dims.value.heatmap.y + scale.value.y(node[props.rowKey].toString()) + scale.value.y.bandwidth();

        if (event.offsetX > x1 && event.offsetX <= x2
            && event.offsetY > y1 && event.offsetY <= y2) {
            tooltipPosition.value = {
                x: event.clientX,
                y: event.clientY
            };
            hoverItem.value = node;
            (root.value as HTMLElement).style.cursor = 'crosshair';
            return;
        }
    }
    (root.value as HTMLElement).style.cursor = 'inherit';
    tooltipPosition.value = undefined;
    hoverItem.value = undefined;
}, 10);
function heatmap_node_tooltip(item: object) {
    return `<div style="text-align:left;">
                Group: ${item[props.columnKey]}<br />
                Module: ${item[props.rowKey]}<br />
                Usage: ${item[props.valueKey].toExponential(3)}
            </div>`;
}

</script>

<style scoped>
.clustered-heatmap-container {
    overflow: hidden;
}
</style>