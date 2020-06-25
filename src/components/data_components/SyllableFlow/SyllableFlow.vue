<template>
<div :style="{width:'100%', height:'100%', 'overflow': 'hidden'}">
    <svg :width="layout.width" :height="layout.height - 31" @mousemove="debouncedHover" @mouseout="hoverItem = undefined">
        <template v-if="graph.nodes.length > 0 && graph.links.length > 0">
            <text class="axis-label" :transform="`translate(${layout.width / 2}, 15)`">
                {{plotTitle}}
            </text>
            <g>
                <text class="axis-label" :transform="`translate(10, ${(innerHeight / 2) + margin.top}) rotate(-90)`">Incoming</text>
                <text class="axis-label" :transform="`translate(${layout.width - (margin.right / 2)}, ${(innerHeight / 2) + margin.top}) rotate(-90)`">Outgoing</text>
                <g class="node"
                    v-for="n in graph.nodes"
                    :key="n.name"
                    :transform="`translate(${(n.x0 || 0)+1}, ${(n.y0 || 0)})`"
                    @click="onNodeClick(n.id)"
                    :data-nodeid="n.id">
                    <rect
                        :x="0"
                        :y="0"
                        :width="(n.x1 - n.x0 - 2 || 0)"
                        :height="Math.max(1, n.y1 - n.y0) || 0"
                        :fill="color(scale.n(n.id)).darker(0.5)"
                        :data-nodeid="n.id"></rect>
                    <text v-if="Math.max(1, n.y1 - n.y0) > 10"
                        class="node-label"
                        :x="(n.x1 - n.x0 - 2) / 2"
                        :y="Math.max(1, n.y1 - n.y0) / 2"
                        :data-nodeid="n.id">
                        {{n.id}}
                    </text>
                </g>
            </g>
            <g>
                <template v-for="l in graph.links" >
                    <path
                        :key="l.id"
                        class="link"
                        :d="sankeyLinkHorizontal(l)"
                        fill="none"
                        :stroke="scale.l(l)"
                        :stroke-width="Math.max(1, l.width)"
                        :data-color="color_id"
                        :data-transitionid="l.id">
                    </path>
                </template>
            </g>
            <ColorScaleLegend v-if="settings.show_relative_diff"
                    :title="colorLegendTitle"
                    :scale="scale.li"
                    :width="150"
                    :height="10"
                    :transform="`translate(${layout.width / 2}, ${layout.height - margin.bottom - 25})`" />
        </template>
    </svg>
    <div v-if="graph.links.length === 0" class="no-data">
        <b-card bg-variant="primary" text-variant="white" class="text-center">
            <b-card-text>
                No transitions for group {{settings.plot_group}} Module {{selectedSyllable}} ({{dataview.countMethod}})
            </b-card-text>
        </b-card>
    </div>
    <ToolTip :position="tooltipPosition" :show="hoverItem !== undefined">
        <div v-html="tooltip_text" style="text-align:left;"></div>
    </ToolTip>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import RegisterDataComponent from '@/components/Core';
import mixins from 'vue-typed-mixins';
import LoadingMixin from '@/components/Core/LoadingMixin';
import WindowMixin from '@/components/Core/WindowMixin';
import { CountMethod } from '../../../store/dataview.types';
import LoadData from '@/components/Core/DataLoader/DataLoader';
import { scaleOrdinal, scaleDiverging } from 'd3-scale';
import * as d3 from 'd3';
import { sankey, sankeyCenter, sankeyLeft, sankeyRight, sankeyJustify } from 'd3-sankey';
import { linkHorizontal } from 'd3-shape';
import { schemeDark2 } from 'd3-scale-chromatic';
import { color } from 'd3-color';
import {max} from 'd3-array';
import { GetScale } from '@/components/Charts/D3ColorProvider';
import ColorScaleLegend from '@/components/Charts/ColorScaleLegend/ColorScaleLegendSVG.vue';
import ToolTip from '@/components/Charts/ToolTip.vue';
import { debounce } from '@/util/Events';
import {throttle} from '@/util/Events';


export enum NodeAlignment {
    Left = 'Left',
    Right = 'Right',
    Center = 'Center',
    Justify = 'Justify',
}

export enum NodeSortMethods {

}

RegisterDataComponent({
    friendly_name: 'Syllable Flow',
    component_type: 'SyllableFlow',
    settings_type: 'SyllableFlowOptions',
    init_width: 400,
    init_height: 500,
    default_settings: {
        plot_group: '',
        show_relative_diff: false,
        relative_diff_group: '',
        prune_threshold: 0.0,
        colorscale: 'interpolatePuOr',
        node_padding: 3,
        node_width: 36,
        node_alignment: NodeAlignment.Justify,
    },
});

interface Node {
    type: string;
    id: number;
    name: string;
}

interface Link {
    type: string;
    id: string;
    color_id: number,
    source: string;
    target: string;
    value: number;
    real_value: number;
}



export default mixins(WindowMixin, LoadingMixin).extend({
    components: {
        ColorScaleLegend,
        ToolTip,
    },
    data() {
        return {
            raw_data: [] as {group: string, row_id: number, col_id: number, raw: number}[],
            margin: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
            },
            tooltipPosition: undefined as {x: number, y:number}|undefined,
            hoverItem: undefined as object|undefined,
            debouncedHover: (event: MouseEvent) => {/**/},
        };
    },
    mounted() {
        this.debouncedHover = throttle(this.handleHover, 10);
    },
    watch: {
        'sourceData': {
            handler(s) {
                if (s === undefined || !s.is_valid) {
                    return;
                }
                this.emitStartLoading();
                LoadData(s.transitions[0], s.transitions[1], false)
                    .then((data) => this.raw_data = data)
                    .then(() => this.emitFinishLoading());
            },
            immediate: true,
        },
        'settings.show_relative_diff': {
            handler(newValue) {
                newValue ? this.margin.bottom = 70 : this.margin.bottom = 20;
            },
            immediate: true,
        },
    },
    created() {
        if (this.settings.plot_group === undefined || this.settings.plot_group === '') {
            this.$store.commit(`${this.id}/updateComponentSettings`, {
                id: this.id,
                settings: {
                    plot_group: this.dataview.selectedGroups[0],
                },
            });
        }
        if (this.settings.relative_diff_group === undefined || this.settings.relative_diff_group === '') {
            this.$store.commit(`${this.id}/updateComponentSettings`, {
                id: this.id,
                settings: {
                    relative_diff_group: this.dataview.selectedGroups[1],
                },
            });
        }
    },
    computed: {
        tooltip_text(): string {
            if (this.hoverItem !== undefined) {
                let hi = this.hoverItem as Node|Link;
                if (hi.type === 'node') {
                    return `Module ${hi.id}`;
                } else if (hi.type === 'edge') {
                    hi = hi as Link;
                    return `Transition ${hi.id}<br />P(t) = ${hi.real_value.toExponential(3)}`;
                }
            }
            return '';
        },
        colorLegendTitle(): string {
            if (this.settings.show_relative_diff) {
                return `TP(${this.settings.plot_group}) - TP(${this.settings.relative_diff_group})`;
            } else {
                return `TP(${this.settings.plot_group})`;
            }
        },
        plotTitle(): string {
            let title = this.settings.plot_group;
            if (this.settings.show_relative_diff) {
                title += ` vs ${this.settings.relative_diff_group}`;
            }
            return title + ` Module ${this.selectedSyllable} (${this.dataview.countMethod})`;
        },
        innerWidth(): number {
            return this.layout.width - this.margin.left - this.margin.right;
        },
        innerHeight(): number {
            return this.layout.height - this.margin.top - this.margin.bottom - 31;
        },
        sankeyLinkHorizontal() {
            return linkHorizontal()
                .source((link: any) => [link.source.x1, link.y0])
                .target((link: any) => [link.target.x0, link.y1]);
        },
        sankeyGen(): any {
            let align;
            switch (this.settings.node_alignment) {
                case NodeAlignment.Left: align = sankeyLeft; break;
                case NodeAlignment.Right: align = sankeyRight; break;
                case NodeAlignment.Center: align = sankeyCenter; break;
                case NodeAlignment.Justify:
                default: align = sankeyJustify; break;
            }
            return sankey()
                .nodeWidth(this.settings.node_width)
                .nodePadding(this.settings.node_padding)
                .nodeAlign(align)
                .extent([
                    [this.margin.left, this.margin.top],
                    [this.margin.left + this.innerWidth, this.margin.top + this.innerHeight],
                ])
                .nodeId((node) => node.name);
        },
        scale(): any {
            const n = scaleOrdinal()
                .range(schemeDark2)
                .domain(this.activeSyllables.map((s) => s.toString()));

            let l;
            let li;
            if (this.settings.show_relative_diff) {
                const abstransMax = max(this.graph.links, (d) => Math.abs(d.real_value)) || 1;
                li = scaleDiverging(GetScale(this.settings.colorscale))
                        .domain([-abstransMax, 0, abstransMax]);
                l = (link: Link) => color(li(link.real_value) as string)
            } else {
                li = scaleOrdinal()
                    .range(schemeDark2)
                    .domain(this.activeSyllables.map((s) => s.toString()));
                l = (link: Link) => color(li(link.color_id.toString()) as string)!.brighter(0.5)
            }

            return { n, l, li };
        },
        sourceData(): any {
            const transSource = this.$store.getters[`datasets/resolve`]('individual_transitions');

            const relDiffGroup = this.settings.relative_diff_group;
            const filterGroups = [...(this.settings.show_relative_diff ?
                [this.settings.plot_group, relDiffGroup] : [this.settings.plot_group])];

            const transFilters = [
                {
                    type: 'map',
                    columns: [
                        ['default_group', 'group'],
                        [`row_id_${this.dataview.countMethod.toLowerCase()}`, 'row_id'],
                        [`col_id_${this.dataview.countMethod.toLowerCase()}`, 'col_id'],
                        'raw',
                    ]
                },
                {
                    type: 'filter',
                    filters: {
                        group: filterGroups,
                    },
                },
                {
                    type: 'aggregate',
                    groupby: [
                        'group',
                        'row_id',
                        'col_id',
                    ],
                    aggregate: {
                        raw: 'sum'
                    },
                },
                {
                    type: 'sort',
                    columns: ['row_id', 'col_id',],
                    direction: 'asc',
                }
            ];
            return {
                transitions: [transSource, transFilters],
                is_valid: filterGroups.filter((g) => g !== '' && g !== undefined).length > 0,
            };
        },
        graph(): {nodes: Node[], links: Link[]} {
            const trans = this.raw_data.filter((row) => row.group === this.settings.plot_group);
            const transSum = trans.reduce((acc, curr) => acc + curr.raw, 0);
            const relTrans = this.raw_data.filter((row) => row.group === this.settings.relative_diff_group);
            const relTransSum = relTrans.reduce((acc, curr) => acc + curr.raw, 0);

            const g = { nodes: [] as Node[], links: [] as Link[] };
            if (trans === undefined || trans.length === 0) {
                return g;
            }
            if (this.settings.show_relative_diff && (relTrans === undefined || relTrans.length === 0)) {
                return g;
            }
            // the central node
            g.nodes.push({
                type: 'node',
                id: this.selectedSyllable,
                name: this.selectedSyllable.toString(),
            });

            // incoming links
            for (const [i, t] of trans.filter((row) => row.col_id === this.selectedSyllable).entries()) {
                if (this.activeSyllables.includes(t.row_id) && t.row_id !== this.selectedSyllable) {
                    const val = (t.raw / transSum);
                    if (val > this.settings.prune_threshold) {
                        const inName = `in-${t.row_id}`;
                        g.nodes.push({
                            type: 'node',
                            id: t.row_id,
                            name: inName,
                        });
                        const relval = this.settings.show_relative_diff
                                ?  (t.raw / transSum) - (relTrans[i].raw / relTransSum)
                                : (t.raw / transSum);
                        g.links.push({
                            type: 'edge',
                            id: `${t.row_id} → ${this.selectedSyllable}`,
                            color_id: t.row_id,
                            source: inName,
                            target: this.selectedSyllable.toString(),
                            value: val,
                            real_value: relval,
                        });
                    }
                }
            }
            // outgoing links
            for (const [i, t] of trans.filter((row) => row.row_id === this.selectedSyllable).entries()) {
                if (this.activeSyllables.includes(t.col_id) && t.col_id !== this.selectedSyllable) {
                    const val = (t.raw / transSum);
                    if (val > this.settings.prune_threshold) {
                        const outName = `out-${t.col_id}`;
                        g.nodes.push({
                            type: 'node',
                            id: t.col_id,
                            name: outName,
                        });
                        const relval = this.settings.show_relative_diff
                                ?  (t.raw / transSum) - (relTrans[i].raw / relTransSum)
                                : (t.raw / transSum);
                        g.links.push({
                            type: 'edge',
                            id: `${this.selectedSyllable} → ${t.col_id}`,
                            color_id: t.col_id,
                            source: this.selectedSyllable.toString(),
                            target: outName,
                            value: val,
                            real_value: relval,
                        });
                    }
                }
            }
            if (g.nodes.length > 0) {
                return this.sankeyGen(g);
            }
            return g;
        },
        activeSyllables(): number[] {
            if (this.dataview.moduleIdFilter.length === 0) {
                return this.$store.getters[`${this.datasource}/availableModuleIds`];
            } else {
                return this.dataview.moduleIdFilter;
            }
        },
        selectedSyllable: {
            get(): number {
                return this.dataview.selectedSyllable;
            },
            set(event: number) {
                this.$store.commit(`${this.datasource}/setSelectedSyllable`, event);
            },
        },
    },
    methods: {
        color(value) {
            return color(value)
        },
        onNodeClick(event) {
            this.selectedSyllable = Number.parseInt(event, 10);
        },
        handleHover(event: MouseEvent) {
            if (event && event.target !== null){
                const target = event.target as HTMLElement;
                if (target.dataset.nodeid) {
                    this.tooltipPosition = {
                        x: event.clientX,
                        y: event.clientY
                    };
                    this.hoverItem = this.graph.nodes.find((n) => n.id.toString() === target.dataset.nodeid);
                    return;
                }

                if (target.dataset.transitionid) {
                    this.tooltipPosition = {
                        x: event.clientX,
                        y: event.clientY
                    };
                    this.hoverItem = this.graph.links.find((n) => n.id.toString() === target.dataset.transitionid);
                    return;
                }
            }
            this.tooltipPosition = undefined;
            this.hoverItem = undefined;
        },
    },
});
</script>

<style scoped>
.link {
    mix-blend-mode: multiply;
}
g.node {
    cursor: pointer;
}
.node-label {
    text-anchor: middle;
    alignment-baseline: middle;
    dominant-baseline: middle;
}
.axis-label {
    text-anchor: middle;
}
.no-data .card {
    width: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
</style>