<template>
    <div>
        <svg ref="canvas" :width="width" :height="height" @mousemove="handleHeatmapHover" @mouseleave="hoverItem = undefined">
            <g v-show="has_data">
                <g class="heatmap" :transform="`translate(${dims.heatmap.x},${dims.heatmap.y})`" @click="handleHeatmapClick">
                    <template v-for="node in data" :key="`${node[columnKey]}-${node[rowKey]}`">
                        <rect
                            :x="scale.x(node[columnKey].toString())"
                            :y="scale.y(node[rowKey].toString())"
                            :width="scale.x.bandwidth()"
                            :height="scale.y.bandwidth()"
                            :fill="scale.z(node[valueKey])"
                            :data-row="node[rowKey]"
                            :data-col="node[columnKey]"
                            :data-val="node[valueKey]"
                            /><!-- v-b-tooltip.html :title="heatmap_node_tooltip(node)"-->
                    </template>
                </g>
                <g class="rtree" v-show="isRowsHClustered" :transform="`translate(${dims.rtree.x},${dims.rtree.y})`">
                    <template v-for="(link, index) in rowLinks" :key="link">
                        <path class="rlink" :d="elbowH(link)" />
                    </template>
                </g>
                <g class="ctree" v-show="isColumnsHClustered" text-anchor="middle" :transform="`translate(${dims.ctree.x},${dims.ctree.y})`">
                    <template v-for="(link, index) in columnLinks" :key="link">
                        <path class="clink" :d="elbowV(link)" />
                    </template>
                </g>
                <g class="x-axis" v-axis:x="scale" :transform="`translate(${dims.xaxis.x},${dims.xaxis.y})`">
                    <text class="label" :x="dims.xaxis.w/2" :y="dims.xaxis.ly">{{xAxisTitle}}</text>
                </g>
                <g class="y-axis" v-axis:y="scale" :transform="`translate(${dims.yaxis.x},${dims.yaxis.y})`">
                    <text class="label" :x="-dims.yaxis.h/2" :y="50" transform="rotate(-90)">{{yAxisTitle}}</text>
                </g>
                <ColorScaleLegend
                    :title="legendTitle"
                    :scale="scale.z"
                    :width="dims.legend.w"
                    :height="10"
                    :transform="`translate(${dims.legend.x}, ${dims.legend.y})`" />
            </g>
        </svg>
        <MessageBox :show="!has_data">{{noDataMessage}}</MessageBox>
        <ToolTip :position="tooltipPosition" :show="hoverItem !== undefined">
            <div v-html="tooltip_text" style="text-align:left;"></div>
        </ToolTip>
    </div>
</template>


<script setup lang="ts">
import { sum, axisBottom, axisRight, select, selectAll } from 'd3';
import {useClusteredHeatmapBase, ClusteredHeatmapBaseProps, ClusteredHeatmapBaseEmits, ClusteredHeatmapBasePropsDefaults, ClusteredHeatmapBaseOverrides, LabelStats} from './ClusteredHeatmapBase';
import ColorScaleLegend from '@render/components/Charts/Colors/ColorScaleLegendSVG.vue';
import ToolTip from '@render/components/Charts/ToolTip.vue';
import MessageBox from '@render/components/Charts/CenteredMessage.vue';
import { throttle } from '@render/util/Events';
import { useTemplateRef, Directive, computed } from 'vue';


const overrides: ClusteredHeatmapBaseOverrides = {
    showSelectedRow: (id: number) => {
        if (!canvas.value) {
            return;
        }
        const labels = [...canvas.value.querySelectorAll('g.y-axis .tick')] as SVGTextElement[];
        for (const l of labels) {
            if (l.getAttribute('data-row') === id.toString()) {
                l.classList.add('selected');
            } else {
                l.classList.remove('selected');
            }
        }
    },
    showSelectedCol: (id: number) => {
        if (!canvas.value) {
            return;
        }
        const labels = [...canvas.value.querySelectorAll('g.x-axis .tick')] as SVGTextElement[];
        for (const l of labels) {
            if (l.getAttribute('data-col') === id.toString()) {
                l.classList.add('selected');
            } else {
                l.classList.remove('selected');
            }
        }
    },
    label_stats: computed<LabelStats>(() => {
        const labels = props.groupLabels;
        if (!canvas.value) {
            return{
                count: 0,
                total: 0,
                longest: 0,
            };
        }
        const tag = document.createElementNS('http://www.w3.org/2000/svg', 'text') as SVGTextElement;
        tag.classList.add('tick-measurement');
        canvas.value.appendChild(tag);
        const widths = labels.map((label) => {
            tag.textContent = label;
            return tag.getBBox().width;
        });
        canvas.value.removeChild(tag);
        return {
            count: widths.length,
            total: sum(widths),
            longest: Math.max(...widths),
        };
    }),
};



const props = withDefaults(defineProps<ClusteredHeatmapBaseProps>(), ClusteredHeatmapBasePropsDefaults());
const emit = defineEmits<ClusteredHeatmapBaseEmits>();
const { dims, scale, has_data, tooltip_text, tooltipPosition, hoverItem, isColumnsHClustered, isRowsHClustered, rowLinks, columnLinks, elbowH, elbowV, shouldHideLabel } = useClusteredHeatmapBase(props, emit, overrides);

const canvas = useTemplateRef('canvas');

function handleHeatmapClick(event: Event) {
    // Fire when heatmap is clicked
    // @arg An event, the row, col, and value of the heatmap
    emit('heatmap-click', {
        e: event,
        row: (event.target as SVGRectElement).dataset.row as string,
        col: (event.target as SVGRectElement).dataset.col as string,
        value: (event.target as SVGRectElement).dataset.val as string,
    });
}
const handleHeatmapHover = throttle((event: MouseEvent) => {
    if (event && event.target !== null){
        const target = event.target as HTMLElement;
        if (target.tagName === 'rect' && target.dataset.row && target.dataset.col) {
            tooltipPosition.value = {
                x: event.clientX,
                y: event.clientY
            };
            const item = (props.data as any[]).find((itm) => {
                return itm[props.columnKey].toString() === target.dataset.col
                    && itm[props.rowKey].toString() === target.dataset.row;
            });
            if (item !== hoverItem.value)
                hoverItem.value = item;
            return;
        }
    }
    tooltipPosition.value = undefined;
    hoverItem.value = undefined;
}, 10);


function draw_axis(el, binding) {
    const axis = binding.arg;
    if (axis !== undefined) {
        const axisMethod = { x: axisBottom, y: axisRight, }[axis];
        const methodArg = binding.value[axis];
        const actualAxis = axisMethod(methodArg);

        // build the axis
        select(el).call(actualAxis);

        // if y-axis, attach "data-syllable" attribute
        if (axis === 'y') {
            selectAll('.y-axis .tick').attr('data-row', (d: any) => d);

            // apply row label colors
            selectAll('.y-axis .tick text').attr('fill', (d: any) => scale.value.rlc(d));
        } else {
            selectAll('.x-axis .tick').attr('data-col', (d: any) => d);

            // apply column label colors
            selectAll('.x-axis .tick text').attr('fill', (d: any) => scale.value.clc(d));
        }

        selectAll('.tick').filter((datum) => shouldHideLabel(datum)).attr('visibility', 'hidden')

        // if x-axis, check rotation
        if (axis === 'x') {
            if (dims.value.rotate_labels) {
                el.classList.add('rotate');
            } else {
                el.classList.remove('rotate');
            }
        }
    }
}

const vAxis: Directive = {
    mounted: draw_axis,
    updated: draw_axis,
}
</script>

<style scoped>
svg :deep(g.rtree path.rlink),
svg :deep(g.ctree path.clink) {
    fill: none;
    stroke: #aaa;
    stroke-width: 1.5px;
    shape-rendering: geometricPrecision;
}
svg  :deep(g.heatmap rect) {
    shape-rendering: crispEdges;
}
svg :deep(g.legend path.domain) {
    stroke:none;
}
svg :deep(g.x-axis text.label),
svg :deep(g.y-axis text.label) {
    font-family: Verdana,Arial,sans-serif;
    font-size: 13px;
    text-anchor:middle;
    fill:#000;
}
svg :deep(g.x-axis.rotate g.tick text) {
    transform: translate(-10px,0px) rotate(-45deg);
    text-anchor: end;
}
svg :deep(text.tick-measurement),
svg :deep(g.tick text) {
    font-size: 10px;
}
svg :deep(g.y-axis g.tick text) {
    font-size: 8px;
}
svg :deep(g.x-axis g.tick line),
svg :deep(g.y-axis g.tick line) {
    stroke: #888;
    shape-rendering: crispEdges;
}
svg :deep(g.x-axis .domain),
svg :deep(g.y-axis .domain) {
    stroke: none;
}
svg :deep(g.heatmap) {
    cursor: crosshair;
}
svg :deep(g.y-axis g.tick) {
    fill: #888;
}

svg :deep(g.y-axis g.tick.selected text),
svg :deep(g.x-axis g.tick.selected text) {
    font-weight: bold;
    font-size: 16px;
    fill: #000;
    z-index: 1000;
}
svg :deep(g.x-axis g.tick.selected text) {
    transform: translateY(12px);
    text-anchor: middle;
}
svg :deep(g.y-axis g.tick.selected text) {
    transform: translateX(18px);
    text-anchor: middle;
}
svg :deep(g.y-axis g.tick.selected line) {
    stroke: #000;
    transform: scaleX(3) scaleY(1.5);
}
svg :deep(g.x-axis g.tick.selected line) {
    stroke: #000;
    transform: scaleX(2) scaleY(3);
}
</style>