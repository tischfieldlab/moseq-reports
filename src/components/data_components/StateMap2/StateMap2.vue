<template>
    <div class="component-container">
        <div ref="container" class="cytoscape-container"></div>
        <svg class="legend-container">
            <ColorScaleLegend
                title="P(transition)"
                :scale="scale.zo"
                :width="150"
                :height="10"
                :transform="`translate(100, 0)`" />
        </svg>
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
import {forceSimulation, forceLink, forceManyBody, forceX, forceY, forceRadial, forceCollide} from 'd3-force';
import { scaleBand, scaleSequential, scaleLinear, scaleDiverging } from 'd3-scale';
import {interpolateNumber} from 'd3-interpolate';
import { GetScale, GetScaleWithOpacity } from '@/components/Charts/D3ColorProvider';
import { extent, max } from 'd3-array';
import * as d3 from 'd3';
import cytoscape from 'cytoscape';
import ColorScaleLegend from '@/components/Charts/ColorScaleLegend/ColorScaleLegendSVG.vue';


import avsdf from 'cytoscape-avsdf';
cytoscape.use(avsdf);


RegisterDataComponent({
    friendly_name: 'State Map 2',
    component_type: 'StateMap2',
    settings_type: 'StateMap2Options',
    init_width: 400,
    init_height: 500,
    default_settings: {
        plot_group: '',
        colorscale: 'interpolateGreens',
        use_opacity: true,
        show_relative_diff: false,
        relative_diff_group: '',
        graph_layout: 'avsdf',
        prune_threshold: 0.001,
    },
});

interface Node {
    data: {
        id: number;
        name: string;
        usage: number;
    }
}

interface Link {
    data: {
        id?: string,
        source: number;
        target: number;
        weight: number;
    };
}

export default mixins(WindowMixin).extend({
    components: {
        ColorScaleLegend,
    },
    data() {
        return {
            transitions: [] as any[],
            usages: [] as any[],
        };
    },
    watch: {
        sourceData: {
            async handler(s) {
                if (s === undefined) {
                    return;
                }
                this.usages = await LoadData(s.usage[0], s.usage[1], true);
                this.transitions = await LoadData(s.transitions[0], s.transitions[1], true);
            },
            immediate: true,
        },
        elements: {
            handler(newValue) {
                const cy = (this as any).cy;
                if (cy === undefined) {
                    return;
                }
                cy.startBatch();
                cy.remove('node');
                cy.add(this.elements);
                cy.layout(this.graph_layout).run();
                cy.endBatch();
            },
        },
        graph_layout() {
            const cy = (this as any).cy;
            cy.layout(this.graph_layout).run();
        },
        layout() {
            const cy = (this as any).cy;
            cy.layout(this.graph_layout).run();
        },
        scale() {
            const cy = (this as any).cy;
            cy.style(this.graph_styles);
        },
    },
    async mounted() {
        if (this.settings.plot_group === '') {
            this.$store.commit(`${this.id}/updateComponentSettings`, {
                id: this.id,
                settings: {
                    plot_group: this.dataview.selectedGroups[0],
                },
            });
        }
        const cy = cytoscape({
            container: this.$refs.container,
            elements: [],
            style: this.graph_styles,
            minZoom: 1e-2,
            maxZoom: 1e3,
        });
        cy.on('click', 'node', this.onNodeClick);
        (this as any).cy = cy;
    },
    computed: {
        graph_layout() {
            return {
                name: this.settings.graph_layout,
            };
        },
        graph_styles(): any[] {
            return [ // the stylesheet for the graph
                {
                    selector: 'node',
                    style: {
                        'background-color': '#666',
                        'label': 'data(id)',
                        'width': (n) => this.scale.r(n.data('usage')),
                        'height': (n) => this.scale.r(n.data('usage')),
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': (d) => this.scale.t(Math.abs(d.data('weight'))),
                        'opacity': this.settings.use_opacity ? (d) => this.scale.o(d.data('weight')) : 1,
                        'line-color': (d) => this.scale.z(d.data('weight')),
                        'target-arrow-color': (d) => this.scale.z(d.data('weight')),
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier'
                    }
                },
                {
                    selector: 'edge:active',
                    style: {
                        'label': 'data(id)',
                    }
                }
            ];
        },
        elements(): any[] {
            return [...this.nodes, ...this.links];
        },
        nodes(): any[] {
            if (this.usages.length === 0) {
                return [];
            }
            const nodes = [] as Node[];
            for (const s of this.activeSyllables) {
                nodes.push({
                    data: {
                        id: s,
                        name: s.toString(),
                        usage: this.usages.find((row) => row.syllable === s).usage || 0,
                    },
                });
            }
            return nodes;
        },
        links(): any[] {
            const trans = this.transitions[this.settings.plot_group];
            const relTrans = this.transitions[this.settings.relative_diff_group];
            if (trans === undefined || trans.length === 0) {
                return [];
            }
            if (this.settings.show_relative_diff && relTrans === undefined) {
                return [];
            }
            const links = [] as Link[];
            for (let s = 0; s < trans.length; s++) {
                for (let d = 0; d < trans[s].length; d++) {
                    if (this.activeSyllables.includes(s) && this.activeSyllables.includes(d)) {
                        if (trans[s][d] > 0 && trans[s][d] >= this.settings.prune_threshold) {
                            if (this.settings.show_relative_diff) {
                                links.push({
                                    data: {
                                        id: `${s}->${d}`,
                                        source: s,
                                        target: d,
                                        weight: trans[s][d] - relTrans[s][d],
                                    },
                                });
                            } else {
                                links.push({
                                    data: {
                                        id: `${s}->${d}`,
                                        source: s,
                                        target: d,
                                        weight: trans[s][d],
                                    },
                                });
                            }
                        }
                    }
                }
            }
            return links;
        },
        scale(): any {
            const r = scaleLinear()
                        .domain(extent((this.usages).map((n) => n.usage)) as [number, number])
                        .range([5, 20]);

            const abstransMax = this.links.length > 0 ? max(this.links, (d) => Math.abs(d.data.weight)) as number : 1;
            const transExtent = this.links.length > 0 ? extent(this.links, (d) => d.data.weight) as [number, number] : 1;
            let transDomain: number[];
            let t;
            let o;
            let z;
            let zo;
            if (transExtent[0] < 0) {
                transDomain = [-abstransMax, 0, abstransMax];
                t = scaleLinear()
                            .domain([0, abstransMax])
                            .range([1, 10]);

                zo = scaleLinear()
                            .domain([0.0, 0.5, 1.0])
                            .range([1.0, 0.0, 1.0])
                            .clamp(true);

                o = scaleLinear()
                            .domain(transDomain)
                            .range([1.0, 0.0, 1.0])
                            .clamp(true);

                z = scaleDiverging(GetScale(this.settings.colorscale))
                            .domain(transDomain  as [number, number, number]);
                zo = scaleDiverging(this.settings.use_opacity ?
                                        GetScaleWithOpacity(this.settings.colorscale, zo) :
                                        GetScale(this.settings.colorscale))
                            .domain(transDomain  as [number, number, number]);
            } else {
                transDomain = [0, abstransMax] as [number, number];
                t = scaleLinear()
                            .domain(transDomain)
                            .range([1, 10]);

                o = scaleLinear()
                            .domain(transDomain)
                            .range([0, 1]);

                z = scaleSequential(GetScale(this.settings.colorscale))
                            .domain(transDomain  as [number, number]);
                zo = scaleSequential(GetScaleWithOpacity(this.settings.colorscale, o))
                            .domain(transDomain as [number, number]);
            }
            return { r, t, o, z, zo };
        },
        sourceData(): any {
            let usageSource;
            let transSource;
            if (this.dataview.countMethod === CountMethod.Usage) {
                usageSource = this.$store.getters[`datasets/resolve`]('usage_usage');
                transSource = this.$store.getters[`datasets/resolve`]('transitions_usage');
            } else if (this.dataview.countMethod === CountMethod.Frames) {
                usageSource = this.$store.getters[`datasets/resolve`]('usage_frames');
                transSource = this.$store.getters[`datasets/resolve`]('transitions_frames');
            } else {
                throw new Error(`Count method ${this.dataview.countMethod} is not supported`);
            }
            const showRelDiff = this.settings.show_relative_diff;
            const relDiffGroup = this.settings.relative_diff_group;

            const usageFilters = [
                {
                    type: 'map',
                    columns: [
                        ['usage', 'usage'],
                        ['group', 'group'],
                        ['syllable', 'syllable'],
                    ],
                },
                {
                    type: 'filter',
                    filters: {
                        group: [...(showRelDiff ?
                                    [this.settings.plot_group, relDiffGroup] : [this.settings.plot_group])],
                        syllable: this.activeSyllables,
                    },
                },
                {
                    type: 'aggregate',
                    groupby: ['syllable', 'group'],
                    aggregate: {
                        usage: 'mean',
                    },
                },
            ];

            const transFilters = [
                {
                    type: 'pluck',
                    column: [...(showRelDiff ?
                                    [this.settings.plot_group, relDiffGroup] : [this.settings.plot_group])],
                },
            ];
            return {
                usage: [usageSource, usageFilters],
                transitions: [transSource, transFilters],
            };
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
        nodeColor(n) {
            return this.scale.r(n.data('usage'));
        },
        linkColor(l) {
            return this.scale.z(l.data('weight'));
                        /*.replace('rgb', 'rgba')
                        .replace(')', `, ${this.scale.o(Math.abs(l.data('weight')))})`)*/;
        },
        onNodeClick(event) {
            if (event.target && event.target._private.data.id) {
                this.selectedSyllable = Number.parseInt(event.target._private.data.id, 10);
            }
        },
    },
});
</script>

<style scoped>
.component-container {
    width: 100%;
    height: 100%;
}
.cytoscape-container {
    width: 100%;
    height: calc(100% - 60px);
    position: abosulte;
    top:0px;
    left: 0px;
}
.legend-container {
    width: 100%;
    height: 60px;
}
</style>