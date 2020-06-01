<template>
    <svg ref="canvas" :width="this.layout.width" :height="this.layout.height - 31">
        <g :id="nodes"></g>
        <g :id="links"></g>
        <!--<g class="nodes">
            <template v-for="n in nodes">
                <g  class="node"
                    :data-id="n.id"
                    :key="n.id"
                    :transform="`translate(${n.x},${n.y})`"
                    v-draggable="n">
                    <circle
                        :r="scale.r(n.usage)"
                        stroke="white"
                        stroke-width="1.5" />
                    <text x="8" y="0.31em" fill="none" stroke="white" stroke-width="3">{{n.id}}</text>
                    <text x="8" y="0.31em">{{n.id}}</text>
                </g>
            </template>
        </g>

        <g class="links">
            <template v-for="l in links">
                <pa th
                    :key="l.id"
                    :d="linkArc(l)"
                    fill="none"
                    :stroke-width="scale.t(l.weight)"
                    :stroke="scale.z(l.weight)"
                    :stroke-opacity="scale.o(l.weight)"
                    :marker-end="`url(#arrow-${l.id})`"
                    />
            </template>
        </g>-->
        <defs>
            <template v-for="l in links">
                <marker :key="l.id"
                    :id="`arrow-${l.id}`"
                    viewBox="0 -5 10 10"
                    refX="15" refY="-0.5"
                    markerWidth="3" markerHeight="3"
                    orient="auto">

                    <path :fill="scale.z(l.weight)" :fill-opacity="scale.o(l.weight)" d="M0,-5L10,0L0,5" />
                </marker>
            </template>
        </defs>
    </svg>
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

RegisterDataComponent({
    friendly_name: 'State Map',
    component_type: 'StateMap',
    settings_type: 'StateMap',
    init_width: 400,
    init_height: 500,
    default_settings: {},
});

interface Node {
    id: number;
    name: string;
    usage: number;
    x: number;
    y: number;
}

interface Link {
    id?: string,
    source: number;
    target: number;
    weight: number;
}

export default mixins(WindowMixin).extend({
    data() {
        return {
            graph: {} as {nodes: Node[], links: Link[]},
            simulation: {} as any,
            drag: ((s) => d3.drag()) as (sim: d3.Simulation<d3.SimulationNodeDatum, d3.SimulationLinkDatum<d3.SimulationNodeDatum>>) => d3.DragBehavior<Element, unknown, unknown>,
        };
    },
    async mounted() {
        const transitions = await LoadData(this.transitionsSource, this.transitionsSourceFilters);
        const usages = await LoadData(this.usageSource, this.usageSourceFilters);

        const links = [] as Link[];
        for (let s = 0; s < transitions.length; s++) {
            for (let d = 0; d < transitions[s].length; d++) {
                if (this.activeSyllables.includes(s) && this.activeSyllables.includes(d)) {
                    if (transitions[s][d] > 0.001) {
                        links.push({
                            source: s,
                            target: d,
                            weight: transitions[s][d],
                        });
                    }
                }
            }
        }

        const nodes = [] as Node[];
        for (const g of ['C57_Jax_F_+/+']) {
            for (const s of this.activeSyllables) {
                nodes.push({
                    id: s,
                    name: s.toString(),
                    usage: usages.find((row) => row.syllable === s && row.group === g).usage,
                    x: this.layout.width / 2,
                    y: this.layout.height / 2,
                });
            }
        }
        this.graph = {
            nodes,
            links,
        };
        this.drag = (simulation) => {
            function dragstarted(d) {
                if (!d3.event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }
            function dragged(d) {
                d.fx = d3.event.x;
                d.fy = d3.event.y;
            }
            function dragended(d) {
                if (!d3.event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }
            return d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended);
        }
        const r = Math.min(this.layout.width / 3, this.layout.height / 3);
        this.simulation = forceSimulation(this.graph.nodes)
                .force('link', forceLink(this.graph.links).distance(r*2))
                .force('charge', forceCollide().radius((n) => this.scale.r((n as any).usage)))
                .force('radial', forceRadial(r).strength(1).x(this.layout.width / 2).y(this.layout.height / 2))
                // .force('charge', forceManyBody().strength(-400))
                .force('x', forceX(this.layout.width / 2))
                .force('y', forceY(this.layout.height / 2));
        // this.simulation.on('tick', () => this.$forceUpdate());
        this.simulation.on('tick', () => {
            this.links.attr('d', (d) => this.linkArc(d));
            this.nodes.attr('transform', (d) => `translate(${d.x},${d.y})`);
        });

    },
    /*watch: {
        layout: {
            handler() {
                this.simulation.restart();
            },
            deep: true,
        },
    },*/
    computed: {
        nodes(): any {
            // console.log(this.graph.nodes);
            if (this.graph.nodes === undefined) {
                return;
            }
            const node = d3.select(this.$refs.canvas as SVGElement)
                .append('g')
                    .attr('class', 'nodes')
                    .attr('fill', 'currentColor')
                    .attr('stroke-linecap', 'round')
                    .attr('stroke-linejoin', 'round')
                .selectAll('g')
                .data(this.graph.nodes)
                .join('g')
                    .call(this.drag(this.simulation) as any);

            node.append('circle')
                    .attr('stroke', 'white')
                    .attr('stroke-width', 1.5)
                    .attr('r', (d) => this.scale.r(d.usage));

            node.append('text')
                    .attr('x', 8)
                    .attr('y', '0.31em')
                    .text((d) => d.id)
                .clone(true).lower()
                    .attr('fill', 'none')
                    .attr('stroke', 'white')
                    .attr('stroke-width', 3);
            return node;
        },
        links(): any {
            if (this.graph.links === undefined) {
                return;
            }
            return d3.select(this.$refs.canvas as SVGElement)
                .append('g')
                    .attr('fill', 'none')
                    .attr('stroke-width', 1.5)
                .selectAll('path')
                .data(this.graph.links)
                .join('path')
                    .attr('stroke-width', (d) => this.scale.t(d.weight))
                    .attr('stroke-opacity', (d) => this.scale.o(d.weight))
                    .attr('stroke', (d) => this.scale.z(d.weight))
                    .attr('marker-end', (d) => `url(#arrow-${d.id}`);
        },
        colormap(): any {
            return GetScale('interpolateGreens');
        },
        scale(): any {
            const r = scaleLinear()
                        .domain(extent((this.graph.nodes).map((n) => n.usage)) as [number, number])
                        .range([1, 20]);

            const ext = extent((this.graph.links).map((n) => n.weight)) as [number, number];
            const t = scaleLinear()
                        .domain(ext)
                        .range([1, 10]);

            const o = scaleLinear()
                        .domain(ext)
                        .range([0, 1]);

            const z = scaleSequential(this.colormap || ((n) => n))
                .domain(ext as [number, number]);

            return { r, t, o, z };
        },
        linkArc: () => (d) => {
            const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
            return `
                M${d.source.x},${d.source.y}
                A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
            `;
        },
        usageSource(): string {
            if (this.dataview.countMethod === CountMethod.Usage) {
                return this.$store.getters[`datasets/resolve`]('usage_usage');
            } else if (this.dataview.countMethod === CountMethod.Frames) {
                return this.$store.getters[`datasets/resolve`]('usage_frames');
            } else {
                throw new Error(`Count method ${this.dataview.countMethod} is not supported`);
            }
        },
        usageSourceFilters(): any[] {
            return [
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
        },
        transitionsSource(): string {
            if (this.dataview.countMethod === CountMethod.Usage) {
                return this.$store.getters[`datasets/resolve`]('transitions_usage');
            } else if (this.dataview.countMethod === CountMethod.Frames) {
                return this.$store.getters[`datasets/resolve`]('transitions_frames');
            } else {
                throw new Error(`Count method ${this.dataview.countMethod} is not supported`);
            }
        },
        transitionsSourceFilters(): any[] {
            return [
                {
                    type: 'pluck',
                    column: 'C57_Jax_F_+/+',
                },
            ];
        },
        activeSyllables(): number[] {
            if (this.dataview.moduleIdFilter.length === 0) {
                return this.$store.getters[`${this.datasource}/availableModuleIds`];
            } else {
                return this.dataview.moduleIdFilter;
            }
        },
    },/*
    directives: {
        draggable: {
            inserted(el, binding, vnode) {
                console.log(el, binding.value);
                //(vnode.context as any).drag(binding.value);
                d3.select(el).call((vnode.context as any).drag.subject(() => binding.value));
            }
        },
    },*/
});
</script>

<style scoped>

</style>