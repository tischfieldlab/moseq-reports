<template>
    <div ref="container" style="width:100%; height:100%; position:abosulte; top:0px; left: 0px;"></div>
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
import { scaleBand, scaleSequential, scaleLinear } from 'd3-scale';
import { GetScale } from '@/components/Charts/D3ColorProvider';
import { extent } from 'd3-array';
import * as d3 from 'd3';
import cytoscape from 'cytoscape';

import avsdf from 'cytoscape-avsdf';
cytoscape.use( avsdf );


RegisterDataComponent({
    friendly_name: 'State Map 2',
    component_type: 'StateMap2',
    settings_type: 'StateMap2',
    init_width: 400,
    init_height: 500,
    default_settings: {},
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
    data() {
        return {
            transitions: [] as any[],
            usages: [] as any[],
            trans_ext: [0, 0],
        };
    },
    watch: {
        sourceData: {
            async handler(s) {
                if (s === undefined) {
                    return;
                }
                this.usages = await LoadData(s.usage[0], s.usage[1]);
                this.transitions = await LoadData(s.transitions[0], s.transitions[1]);
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
        }
    },
    async mounted() {
        const cy = cytoscape({
            container: this.$refs.container,
            elements: [],
            style: [ // the stylesheet for the graph
                {
                    selector: 'node',
                    style: {
                        'background-color': '#666',
                        'label': 'data(id)',
                        'width': (n) => this.scale.r(n._private.data.usage),
                        'height': (n) => this.scale.r(n._private.data.usage),
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': (d) => this.scale.t(d._private.data.weight),
                        'line-color': (d) => this.scale.z(d._private.data.weight),
                        'target-arrow-color': (d) => this.scale.z(d._private.data.weight),
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier'
                    }
                }
            ],
        });
        cy.on('click', 'node', this.onNodeClick);
        (this as any).cy = cy;
    },
    computed: {
        graph_layout() {
            return {
                name: 'avsdf',
            };
        },
        elements(): any[] {
            return [...this.nodes, ...this.links];
        },
        nodes(): any[] {
            if (this.usages.length === 0) {
                return [];
            }
            const nodes = [] as Node[];
            for (const g of ['C57_Jax_F_+/+']) {
                for (const s of this.activeSyllables) {
                    nodes.push({
                        data: {
                            id: s,
                            name: s.toString(),
                            usage: this.usages.find((row) => row.syllable === s && row.group === g).usage,
                        },
                    });
                }
            }
            return nodes;
        },
        links(): any[] {
            const links = [] as Link[];
            for (let s = 0; s < this.transitions.length; s++) {
                for (let d = 0; d < this.transitions[s].length; d++) {
                    if (this.activeSyllables.includes(s) && this.activeSyllables.includes(d)) {
                        if (this.transitions[s][d] > 0.001) {
                            links.push({
                                data: {
                                    id: `${s}->${d}`,
                                    source: s,
                                    target: d,
                                    weight: this.transitions[s][d],
                                },
                            });
                        }
                    }
                }
            }
            this.trans_ext = extent(links.map((n) => n.data.weight)) as [number, number];
            return links;
        },
        colormap(): any {
            return GetScale('interpolateGreens');
        },
        scale(): any {
            const r = scaleLinear()
                        .domain(extent((this.usages).map((n) => n.usage)) as [number, number])
                        .range([5, 20]);

            const t = scaleLinear()
                        .domain(this.trans_ext)
                        .range([1, 10]);

            const o = scaleLinear()
                        .domain(this.trans_ext)
                        .range([0, 1]);

            const z = scaleSequential(this.colormap || ((n) => n))
                .domain(this.trans_ext as [number, number]);

            return { r, t, o, z };
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
                        group: ['C57_Jax_F_+/+'], // this.dataview.selectedGroups,
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
                    column: 'C57_Jax_F_+/+',
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
        onNodeClick(event) {
            if (event.target && event.target._private.data.id) {
                this.selectedSyllable = Number.parseInt(event.target._private.data.id, 10);
            }
        },
    },
});
</script>

<style scoped>

</style>