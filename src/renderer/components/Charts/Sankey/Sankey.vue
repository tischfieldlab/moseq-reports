<template>
    <div class="sankey-container">
        <svg :width="width" :height="height" @mousemove="debouncedHover" @mouseout="hoverItem = undefined">
            <template v-if="graph.nodes.length > 0 && graph.links.length > 0">
                <text class="axis-label" :transform="`translate(${width / 2}, 15)`">
                    {{ title }}
                </text>
                <g>
                    <text class="axis-label"
                        :transform="`translate(10, ${(innerHeight / 2) + margin.top}) rotate(-90)`">Incoming</text>
                    <text class="axis-label"
                        :transform="`translate(${width - (margin.right / 2)}, ${(innerHeight / 2) + margin.top}) rotate(-90)`">Outgoing</text>
                    <g class="node" v-for="n in graph.nodes" :key="n.name"
                        :transform="`translate(${(n.x0 || 0) + 1}, ${(n.y0 || 0)})`" @click="onNodeClick($event, n)"
                        :data-nodeid="n.id">
                        <rect :x="0" :y="0" :width="(n.x1 - n.x0 - 2 || 0)" :height="Math.max(1, n.y1 - n.y0) || 0"
                            :fill="color(scale.n(n[nodeColorProperty])).darker(0.5).toString()" :data-nodeid="n.id"></rect>
                        <text v-if="Math.max(1, n.y1 - n.y0) > 10" class="node-label" :x="(n.x1 - n.x0 - 2) / 2 - 6"
                            :y="Math.max(1, n.y1 - n.y0) / 2" :data-nodeid="n.id">
                            {{ n.id }}
                        </text>
                    </g>
                </g>
                <g>
                    <template v-for="l in graph.links" :key="l.id">
                        <path class="link" :d="sankeyLinkHorizontal(l)" fill="none" :stroke="scale.l(l)"
                            :stroke-width="Math.max(1, l.width || 1)" :data-transitionid="l.id"
                            @click="onEdgeClick($event, l)"></path>
                    </template>
                </g>
                <ColorScaleLegend v-if="showColorLegend" :title="colorLegendTitle" :scale="scale.li" :width="150"
                    :height="10" :transform="`translate(${width / 2}, ${height - margin.bottom})`" />
            </template>
        </svg>
        <div v-if="graph.links.length === 0" class="no-data">
            <BCard bg-variant="primary" text-variant="white" class="text-center">
                <BCardText>{{ noDataMessage }}</BCardText>
            </BCard>
        </div>
        <ToolTip :position="tooltipPosition" :show="hoverItem !== undefined">
            <div v-html="tooltip_text" style="text-align:left;"></div>
        </ToolTip>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';
import { sankey, sankeyCenter, sankeyLeft, sankeyRight, sankeyJustify, SankeyLayout, SankeyGraph } from 'd3-sankey';
import { linkHorizontal } from 'd3-shape';
import { color } from 'd3-color';
import { scaleOrdinal, scaleDiverging, ScaleOrdinal } from 'd3-scale';
import { max } from 'd3-array';
import { throttle } from '@render/util/Events';
import ToolTip from '@render/components/Charts/ToolTip.vue';
import ColorScaleLegend from '@render/components/Charts/Colors/ColorScaleLegendSVG.vue';
import { GetScale } from '@render/components/Charts/Colors/D3ColorProvider';
import { Node, Link, NodeAlignment, ColoringMode, CompleteSankeyLink, CompleteSankeyNode } from './Sankey.types';

interface Props {
    data: { nodes: Node[]; links: Link[] };
    width: number;
    height: number;
    colorLegendTitle: string;
    title?: string;
    tooltipFormatter?: (item: Node | Link) => string;
    nodeIdSuperset?: string[];
    nodeAlignment?: NodeAlignment;
    nodeWidth?: number;
    nodePadding?: number;
    nodeColorMode: ColoringMode;
    nodeColorProperty: string;
    linkColorMode: ColoringMode;
    linkColorProperty: string;
    categoricalColormap?: string;
    quantitativeColormap?: string;
    noDataMessage?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['node-click', 'edge-click']);

const margin = ref({ top: 20, right: 20, bottom: 20, left: 20 });
const tooltipPosition = ref<{ x: number; y: number } | undefined>(undefined);
const hoverItem = ref<Node | Link | undefined>(undefined);

watch(
    () => props.linkColorMode,
    (newValue) => {
        margin.value.bottom = newValue === ColoringMode.Quantitative ? 70 : 20;
    },
    { immediate: true }
);

const innerWidth = computed(() => props.width - margin.value.left - margin.value.right);
const innerHeight = computed(() => props.height - margin.value.top - margin.value.bottom);

const sankeyLinkHorizontal = linkHorizontal()
    .source((link: any) => [link.source.x1, link.y0])
    .target((link: any) => [link.target.x0, link.y1]);

const sankeyGen = computed(() => {
    let align;
    switch (props.nodeAlignment) {
        case NodeAlignment.Left:
            align = sankeyLeft;
            break;
        case NodeAlignment.Right:
            align = sankeyRight;
            break;
        case NodeAlignment.Center:
            align = sankeyCenter;
            break;
        case NodeAlignment.Justify:
        default:
            align = sankeyJustify;
            break;
    }
    return sankey<Node, Link>()
        .nodeWidth(props.nodeWidth || 36)
        .nodePadding(props.nodePadding || 3)
        .nodeAlign(align)
        .extent([
            [margin.value.left, margin.value.top],
            [margin.value.left + innerWidth.value, margin.value.top + innerHeight.value],
        ])
        .nodeId((node) => node.name);
});

const graph = computed(() => {
        if (!props.data || props.data.nodes.length === 0 || props.data.links.length === 0) {
            return { nodes: [], links: [] }; 
    }
    const result = sankeyGen.value(props.data);
    return result as SankeyGraph<CompleteSankeyNode<Node, Link>, CompleteSankeyLink<Node, Link>>;
});

const scale = computed(() => {
    let n: ScaleOrdinal<string, string> = scaleOrdinal<string, string>();
    if (props.nodeColorMode === ColoringMode.Categorical) {
        n = scaleOrdinal<string, string>().range(GetScale(props.categoricalColormap || 'schemeDark2') as string[]);
        if (props.nodeIdSuperset !== undefined) {
            n = n.domain(props.nodeIdSuperset);
        } else {
            n = n.domain(props.data.nodes.map((node) => node[props.nodeColorProperty || 'id']));
        }
    }

    let l: (link: Link) => string;
    let li;
    if (props.linkColorMode === ColoringMode.Quantitative) {
        const abstransMax = max(props.data.links, (d) => Math.abs(d[props.linkColorProperty || 'value'])) || 1;
        li = scaleDiverging(GetScale(props.quantitativeColormap || 'interpolatePuOr') as (t: number) => string).domain([
            -abstransMax,
            0,
            abstransMax,
        ]);
        l = (link: Link) => color(li(link[props.linkColorProperty || 'value']) as string)!.toString();
    } else {
        li = scaleOrdinal()
            .range(GetScale(props.categoricalColormap || 'schemeDark2') as string[])
            .domain(props.data.links.map((d) => d[props.linkColorProperty || 'id']));
        l = (link: Link) => color(li(link[props.linkColorProperty || 'id']) as string)!.brighter(0.5).toString();
    }
    return { n, l, li };
});

const tooltip_text = computed(() => {
    if (hoverItem.value !== undefined) {
        return (props.tooltipFormatter || default_tooltip_formatter)(hoverItem.value);
    }
    return '';
});

const showColorLegend = computed(() => props.linkColorMode === ColoringMode.Quantitative);



function onNodeClick(event: MouseEvent, node: Node) {
    emit('node-click', {
        event,
        type: 'node',
        value: node,
    });
}

function onEdgeClick(event: MouseEvent, edge: Link) {
    emit('edge-click', {
        event,
        type: 'edge',
        value: edge,
    });
}

function handleHover(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.dataset.nodeid) {
        tooltipPosition.value = {
            x: event.clientX,
            y: event.clientY,
        };
        hoverItem.value = props.data.nodes.find((n) => n.id.toString() === target.dataset.nodeid);
        return;
    }

    if (target.dataset.transitionid) {
        tooltipPosition.value = {
            x: event.clientX,
            y: event.clientY,
        };
        hoverItem.value = props.data.links.find((n) => n.id.toString() === target.dataset.transitionid);
        return;
    }

    tooltipPosition.value = undefined;
    hoverItem.value = undefined;
}

const debouncedHover = throttle(handleHover, 10);

function default_tooltip_formatter(hoverItem: Node | Link): string {
    if (hoverItem !== undefined) {
        if ('type' in hoverItem && hoverItem.type === 'node') {
            return `Node ${hoverItem.id}`;
        } else if ('type' in hoverItem && hoverItem.type === 'edge') {
            return `Link ${hoverItem.id}<br />value = ${(hoverItem as Link).value.toExponential(3)}`;
        }
    }
    return '';
}
</script>

<style scoped>
.sankey-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
}
</style>
