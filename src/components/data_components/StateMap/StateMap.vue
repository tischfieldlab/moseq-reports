<template>
    <div class="component-container" data-snapshot-target="snapshot">
        <div ref="container" class="cytoscape-container"></div>
        <SVGHost class="legend-container" ref="legendHost">
            <ColorScaleLegend
                title="P(transition)"
                :scale="scale.zo"
                :width="150"
                :height="10"
                :transform="`translate(100, 0)`" />
        </SVGHost>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { debounce } from '@/util/Events';
import RegisterDataComponent from '@/components/Core';
import mixins from 'vue-typed-mixins';
import LoadingMixin from '@/components/Core/LoadingMixin';
import WindowMixin from '@/components/Core/Window/WindowMixin';
import LoadData from '@/components/Core/DataLoader/DataLoader';
import { scaleSequential, scaleLinear, scaleDiverging } from 'd3-scale';
import { GetScale, GetScaleWithOpacity } from '@/components/Charts/Colors/D3ColorProvider';
import { extent, max } from 'd3-array';
import cytoscape from 'cytoscape';
import ColorScaleLegend from '@/components/Charts/Colors/ColorScaleLegendSVG.vue';
import {composite_images, SnapshotOptions, SubImage, targetToDataURI} from '@/components/Core/SnapshotHelper';
import SVGHost from '@/components/Charts/SVGHost.vue';

import avsdf from 'cytoscape-avsdf';
import { RenderMode } from '@/store/datawindow.types';
cytoscape.use(avsdf);

import fcose from 'cytoscape-fcose';
cytoscape.use(fcose);

import cise from 'cytoscape-cise';
cytoscape.use(cise);

import svg from 'cytoscape-svg';
cytoscape.use(svg);


RegisterDataComponent({
    friendly_name: 'State Map',
    component_type: 'StateMap',
    settings_type: 'StateMapOptions',
    init_width: 400,
    init_height: 500,
    available_render_modes: [RenderMode.CANVAS, RenderMode.SVG],
    default_render_mode: RenderMode.CANVAS,
    default_settings: {
        plot_group: '',
        colorscale: 'interpolateGreens',
        use_opacity: true,
        show_relative_diff: false,
        relative_diff_group: '',
        layout: 'avsdf',
        prune_threshold: 0.001,
        grid_settings: {
            avoid_overlap: true,
            avoid_overlap_padding: 10
        },
        circle_settings: {
            avoid_overlap: true,
            clockwise: true
        },
        concentric_settings: {
            avoid_overlap: true,
            clockwise: true,
            equidistant: false,
            min_node_spacing: 30
        },
        avsdf_settings: {
            node_separation: 60
        },
        fcose_settings: {
            node_separation: 45,
            node_repulsion: 2000,
            ideal_edge_length: 60,
        },
        cise_settings: {
            node_separation: 6,
            node_repulsion: 5,
            ideal_edge_length: 10,
        }
    },
});

interface Node {
    data: {
        type: string,
        id: number;
        name: string;
        usage: number;
    };
}

interface Link {
    data: {
        type: string,
        id?: string,
        source: number;
        target: number;
        weight: number;
    };
}

type LayoutOptions = DefaultLayout|GridLayoutOptions|CircleLayoutOptions|ConcentricLayoutOptions|AvsdfLayoutOptions
                        |FcoseLayoutOptions|CiseLayoutOptions;

interface DefaultLayout {
    name: string
}
interface GridLayoutOptions {
    name: 'grid',
    avoidOverlap: boolean,
    avoidOverlapPadding: number
}

interface CircleLayoutOptions {
    name: 'circle',
    avoidOverlap: boolean,
    clockwise: boolean
}

interface ConcentricLayoutOptions {
    name: 'concentric',
    avoidOverlap: boolean,
    clockwise: boolean,
    equidistant: boolean,
    minNodeSpacing: number
}

interface AvsdfLayoutOptions {
    name: 'avsdf',
    nodeSeparation: number
}
interface FcoseLayoutOptions {
    name: 'fcose',
    nodeSeparation: number,
    nodeRepulsion: number,
    idealEdgeLength: number
}

interface CiseLayoutOptions {
    name: 'cise',
    nodeSeparation: number,
    nodeRepulsion: number,
    idealEdgeLength: number
}

export default mixins(WindowMixin, LoadingMixin).extend({
    components: {
        ColorScaleLegend,
        SVGHost,
    },
    data() {
        return {
            raw_data: {
                transitions: [] as any[],
                usages: [] as any[],
            },
            debouncedLayout: () => {/**/},
        };
    },
    watch: {
        sourceData: {
            async handler(s) {
                if (s === undefined || !s.is_valid) {
                    return;
                }
                this.emitStartLoading();
                const data = Object.freeze({
                    usages: await LoadData(s.usage[0], s.usage[1], false),
                    transitions: await LoadData(s.transitions[0], s.transitions[1], false),
                });
                this.raw_data = data;
                this.emitFinishLoading();
            },
            immediate: true,
        },
        elements: {
            handler(newValue) {
                const cy = (this as any).cy;
                if (cy === undefined || newValue === undefined || newValue.length <= 0) {
                    return;
                }
                cy.startBatch();
                cy.remove('node');
                cy.add(newValue);
                cy.layout(this.graph_layout).run();
                cy.style(this.graph_styles);
                cy.endBatch();
            },
        },
        graph_layout(){
            this.debouncedLayout();
        },
        layout: {
            handler() {
                this.debouncedLayout();
            },
            deep: true,
        },
        scale() {
            const cy = (this as any).cy;
            cy.style(this.graph_styles);
        },
        graph_styles() {
            const cy = (this as any).cy;
            cy.style(this.graph_styles);
        }
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
    mounted() {
        this.debouncedLayout = debounce(this.generateLayout, 500);

        const cy = cytoscape({
            container: this.$refs.container,
            elements: [],
            style: this.graph_styles,
            minZoom: 1e-1,
            maxZoom: 1e2,
        });
        cy.on('click', 'node', this.onNodeClick);
        (this as any).cy = cy;
    },
    computed: {
        // returns current graph layout if changes were made in State Map settings.
        graph_layout(): LayoutOptions{
            switch(this.settings.layout){
                case 'grid':
                    return {
                        name: 'grid',
                        avoidOverlap: this.settings.grid_settings.avoid_overlap,
                        avoidOverlapPadding: this.settings.grid_settings.avoid_overlap_padding
                    }
                case 'circle':
                    return {
                        name: 'circle',
                        avoidOverlap: this.settings.circle_settings.avoid_overlap,
                        clockwise: this.settings.circle_settings.clockwise
                    }
                case 'concentric':
                    return {
                        name: 'concentric',
                        avoidOverlap: this.settings.concentric_settings.avoid_overlap,
                        clockwise: this.settings.concentric_settings.clockwise,
                        equidistant: this.settings.concentric_settings.equidistant,
                        minNodeSpacing: this.settings.concentric_settings.min_node_spacing
                    }
                case 'avsdf':
                    return {
                        name: 'avsdf',
                        nodeSeparation: this.settings.avsdf_settings.node_separation
                    }
                case 'fcose':
                    return {
                        name: 'fcose',
                        nodeSeparation: this.settings.fcose_settings.node_separation,
                        nodeRepulsion: this.settings.fcose_settings.node_repulsion,
                        idealEdgeLength: this.settings.fcose_settings.ideal_edge_length,
                    }
                case 'cise':
                    return {
                        name: 'cise',
                        nodeSeparation: this.settings.cise_settings.node_separation,
                        nodeRepulsion: this.settings.cise_settings.node_repulsion,
                        idealEdgeLength: this.settings.cise_settings.ideal_edge_length,
                    }
            }
            // Layout currently not customizable - return default layout object
            return {name: this.settings.layout}
        },
        // returns current style of the graph.
        graph_styles(): any[] {
            return [ // the stylesheet for the graph
                {
                    selector: 'node',
                    style: {
                        'background-color': '#666',
                        'label': 'data(id)',
                        'width': (n) => this.scale.r(n.data('usage')),
                        'height': (n) => this.scale.r(n.data('usage')),
                    },
                },
                {
                    selector: 'edge',
                    style: {
                        'width': (d) => this.scale.t(Math.abs(d.data('weight'))),
                        'opacity': this.settings.use_opacity ? (d) => this.scale.o(d.data('weight')) : 1,
                        'line-color': (d) => this.scale.z(d.data('weight')),
                        'target-arrow-color': (d) => this.scale.z(d.data('weight')),
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier',
                    },
                },
                {
                    selector: 'edge:active',
                    style: {
                        label: 'data(id)',
                    },
                },
            ];
        },
        // returns Nodes of the Statemap given the current dataset.
        elements(): any[] {
            const trans = this.raw_data.transitions.filter((row) => row.group === this.settings.plot_group);
            const transSum = trans.reduce((acc, curr) => acc + curr.raw, 0);
            const relTrans = this.raw_data.transitions.filter((row) => row.group === this.settings.relative_diff_group);
            const relTransSum = relTrans.reduce((acc, curr) => acc + curr.raw, 0);

            const showRelDiff = this.settings.show_relative_diff;
            if (trans === undefined || trans.length === 0) {
                return [];
            }
            if (showRelDiff && (relTrans === undefined || relTrans.length === 0)) {
                return [];
            }

            const elements = [] as (Node|Link)[];
            for (const s of this.activeSyllables) {
                const n = this.raw_data.usages.find((row) => row.syllable === s);
                if (n !== undefined) {
                    elements.push({
                        data: {
                            type: 'node',
                            id: s,
                            name: s.toString(),
                            usage: n.usage,
                        },
                    });
                }
            }

            for (const [i, t] of trans.entries()) {
                if (this.activeSyllables.includes(t.row_id) && this.activeSyllables.includes(t.col_id)) {
                    const val = (t.raw / transSum);
                    if (showRelDiff && (t.row_id !== relTrans[i].row_id || t.col_id !== relTrans[i].col_id)) {
                        /* tslint:disable-next-line:no-console */
                        console.warn('primary and relative mismatch', t, relTrans[i]);
                    }
                    const relval = showRelDiff
                                ?  (t.raw / transSum) - (relTrans[i].raw / relTransSum)
                                : (t.raw / transSum);
                    if (val > 0 && val > this.settings.prune_threshold) {
                        elements.push({
                            data: {
                                type: 'edge',
                                id: `${t.row_id}->${t.col_id}`,
                                source: t.row_id,
                                target: t.col_id,
                                weight: relval,
                            },
                        });
                    }
                }
            }
            return elements;
        },
        // returns scale of the graph.
        scale(): any {
            const r = scaleLinear()
                        .domain(extent((this.raw_data.usages).map((n) => n.usage)) as [number, number])
                        .range([5, 20]);

            const links = this.elements.filter((d) => d.data.type === 'edge')
            const abstransMax = links.length > 0 ? max(links, (d) => Math.abs(d.data.weight)) as number : 1;
            const transExtent = links.length > 0 ? extent(links, (d) => d.data.weight) as [number, number] : 1;

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

                z = scaleDiverging(GetScale(this.settings.colorscale) as (t: number) => string)
                            .domain(transDomain  as [number, number, number]);
                zo = scaleDiverging((this.settings.use_opacity ?
                                        GetScaleWithOpacity(this.settings.colorscale, zo) :
                                        GetScale(this.settings.colorscale)) as (t: number) => string)
                            .domain(transDomain  as [number, number, number]);
            } else {
                transDomain = [0, abstransMax] as [number, number];
                t = scaleLinear()
                            .domain(transDomain)
                            .range([1, 10]);

                o = scaleLinear()
                            .domain(transDomain)
                            .range([0, 1]);

                z = scaleSequential(GetScale(this.settings.colorscale) as (t: number) => string)
                            .domain(transDomain  as [number, number]);
                zo = scaleSequential(GetScaleWithOpacity(this.settings.colorscale, o))
                            .domain(transDomain as [number, number]);
            }
            return { r, t, o, z, zo };
        },
        // returns usage and transition of Nodes in the Source Data.
        sourceData(): any {
            const usageSource = this.$store.getters[`datasets/resolve`]('usage');
            const transSource = this.$store.getters[`datasets/resolve`]('transitions');

            const showRelDiff = this.settings.show_relative_diff;
            const relDiffGroup = this.settings.relative_diff_group;

            const filterGroups = [...(showRelDiff ?
                [this.settings.plot_group, relDiffGroup] : [this.settings.plot_group])];

            const usageFilters = [
                {
                    type: 'map',
                    columns: [
                        [`usage_${this.dataview.countMethod.toLowerCase()}`, 'usage'],
                        ['group', 'group'],
                        [`id_${this.dataview.countMethod.toLowerCase()}`, 'syllable'],
                    ],
                },
                {
                    type: 'filter',
                    filters: {
                        group: filterGroups,
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
                    columns: [
                        ['row_id', 'asc'],
                        ['col_id', 'asc'],
                    ],
                }
            ];
            return {
                usage: [usageSource, usageFilters],
                transitions: [transSource, transFilters],
                is_valid: filterGroups.filter((g) => g !== '' && g !== undefined).length > 0,
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
        // returns the current node color.
        nodeColor(n) {
            return this.scale.r(n.data('usage'));
        },
        // returns the link color between 2 syllables.
        linkColor(l) {
            return this.scale.z(l.data('weight'));
                        /*.replace('rgb', 'rgba')
                        .replace(')', `, ${this.scale.o(Math.abs(l.data('weight')))})`)*/
        },
        // changes selected syllable to the node clicked.
        onNodeClick(event) {
            if (event.target && event.target._private.data.id) {
                this.selectedSyllable = Number.parseInt(event.target._private.data.id, 10);
            }
        },
        // returns snapshot of the current layout of the State Map.
        snapshot(options: SnapshotOptions): Promise<string> {
            if (options.format === 'svg'){
                /**
                 * This is a bit dirty, but here is what we will do:
                 * 1) grab a SVG version of the cytoscape graph
                 * 2) grab a SVG of the legend
                 *      a) We can only easily get this as a data URI
                 *      b) take data portion of URI, and base64 decode it
                 *      c) take only the inner `<svg>...</svg>` nodes
                 * 3) build a "nested" SVG, containing both the graph and legend
                 * 4) convert to a blob
                 * 5) convert to a data URI
                 */
                return new Promise(async (resolve, reject) => {
                    const svgStr = (this as any).cy.svg({
                        bg: options.backgroundColor,
                        full: false,
                        scale: options.scale,
                    });
                    const legendDataURI = await targetToDataURI(this.$refs.legendHost as Vue, options)
                    const legendSvg = atob(legendDataURI?.split(',')[1] as string);
                    const innerLegendSvgMatch = legendSvg.match(/(<svg.+<\/svg>)/s);
                    const innerLegendSvg = innerLegendSvgMatch != null ? innerLegendSvgMatch[1] : '';
                    const newSvg = '<svg>'+svgStr+innerLegendSvg+'</svg>';
                    const svgBlob = new Blob([newSvg], {type: 'image/svg+xml'});

                    const r = new FileReader();
                    r.onload = (e) => resolve(e?.target?.result as string);
                    r.readAsDataURL(svgBlob);
                });

            } else if (options.format === 'png') {
                return new Promise<string>((resolve, reject) => {
                    return (this as any).cy.png({
                        output: 'blob-promise',
                        bg: options.backgroundColor,
                        full: false,
                        scale: options.scale,
                    })
                    .then((blob: Blob) => {
                        const r = new FileReader();
                        r.onload = (e) => resolve(e?.target?.result as string);
                        r.readAsDataURL(blob);
                    });
                })
                .then((graphURI: string) => {
                    const graphContainer = this.$refs.container as HTMLElement;
                    return {
                        dataURI: graphURI,
                        pos_x: 0,
                        pos_y: 0,
                        width: graphContainer.clientWidth,
                        height: graphContainer.clientHeight,
                    } as SubImage;
                })
                .then(async (graphSubImage: SubImage) => {
                    console.log(graphSubImage);
                    const lel = (this.$refs.legendHost as Vue).$el as HTMLElement;
                    const legend = {
                        dataURI: await targetToDataURI(this.$refs.legendHost as Vue, options),
                        pos_x: 0,
                        pos_y: graphSubImage.height,
                        width: lel.clientWidth,
                        height: lel.clientHeight,
                    } as SubImage;
                    return composite_images([graphSubImage, legend], options);
                });
            } else {
                throw Error('unsupported format: ' + options.format)
            }
        },
        generateLayout(){
            const cy = (this as any).cy;
            this.forceRedraw();
            cy.layout(this.graph_layout).run();
        },
        forceRedraw() {
            const el = this.$refs.container as HTMLElement;
            const display = el.style.display;
            el.style.display = 'none';
            el.style.display = display;
        }
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
    top:0px;
    left: 0px;
}
.legend-container {
    width: 100%;
    height: 60px;
}
</style>