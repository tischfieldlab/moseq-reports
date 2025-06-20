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
</script>

<script setup lang="ts">
import { ref, onBeforeMount, onMounted, useTemplateRef, shallowRef, computed, watchEffect, watch } from 'vue';
import { debounce } from '@render/util/Events';
import RegisterDataComponent from '@render/components/Core';

import { scaleSequential, scaleLinear, scaleDiverging } from 'd3-scale';
import { GetScale, GetScaleWithOpacity } from '@render/components/Charts/Colors/D3ColorProvider';
import { extent, max } from 'd3-array';

import ColorScaleLegend from '@render/components/Charts/Colors/ColorScaleLegendSVG.vue';
import {composite_images, SnapshotOptions, SubImage, targetToDataURI} from '@render/components/Core/SnapshotHelper';
import SVGHost from '@render/components/Charts/SVGHost.vue';
import { RenderMode } from '@store/datawindow.types';
import { useWindowMixin } from '@render/components/Core/Window/WindowMixin';
import { LayoutOptions, Link, Node, StateMapSettings, TransData, UsageData } from './StateMap.types';
import DataService, {Operation} from '@api';

import cytoscape from 'cytoscape';
import avsdf from 'cytoscape-avsdf';
import fcose from 'cytoscape-fcose';
import cise from 'cytoscape-cise';
import svg from 'cytoscape-svg';
import { ComponentPublicInstance } from 'vue';


cytoscape.use(avsdf);
cytoscape.use(fcose);
cytoscape.use(cise);
cytoscape.use(svg);

defineExpose({
    snapshot,
})

const props = defineProps<{
    id: string;
}>();

const {$wstate, dataview, layout, settings} = useWindowMixin<StateMapSettings>(props.id);

const container = useTemplateRef('container');
const legendHost = useTemplateRef('legendHost');

const cy = shallowRef<cytoscape.Core>();

const raw_data = shallowRef({
    transitions: [] as TransData[],
    usages: [] as UsageData[],
});


onBeforeMount(() => {
    if ($wstate.settings.plot_group === undefined || $wstate.settings.plot_group === '') {
        $wstate.updateComponentSettings({
            settings: {
                plot_group: dataview.value.selectedGroups[0],
            },
        });
    }
    if ($wstate.settings.relative_diff_group === undefined || $wstate.settings.relative_diff_group === '') {
        $wstate.updateComponentSettings({
            settings: {
                relative_diff_group: dataview.value.selectedGroups[1],
            },
        });
    }
});

onMounted(() => {
    //this.debouncedLayout = debounce(generateLayout, 500);

    cy.value = cytoscape({
        container: container.value,
        elements: [],
        style: graph_styles.value,
        minZoom: 1e-1,
        maxZoom: 1e2,
    });
    cy.value.on('click', 'node', onNodeClick);

    watch(elements, () => {
        if (cy.value === undefined || elements.value === undefined || elements.value.length <= 0) {
            return;
        }
        cy.value.startBatch();
        cy.value.remove('node');
        cy.value.remove('edge');
        cy.value.add(elements.value);
        cy.value.layout(graph_layout.value).run();
        cy.value.style(graph_styles.value);
        cy.value.endBatch();
    }, {deep: true, immediate: true});
    watch(graph_styles, updateStyles, {immediate: false, deep: true});
    watch(scale, updateStyles, {immediate: false, deep: true});
    watch(graph_layout, generateLayout, {immediate: false, deep: true});
    watch(layout, generateLayout, {immediate: false, deep: true});

    watchEffect(generateLayout);
    watchEffect(async () => {
        const s = sourceData.value;
        if (s === undefined || !s.is_valid) {
            return;
        }
        //this.emitStartLoading();
        const data = {
            usages: await DataService.fetchData<UsageData[]>('usage', s.usage, false),
            transitions: await DataService.fetchData<TransData[]>('transitions', s.transitions, false),
        };
        raw_data.value = data;
        //this.emitFinishLoading();
    });
    
});







// returns current graph layout if changes were made in State Map settings.
const graph_layout = computed((): LayoutOptions =>{
    switch($wstate.settings.layout){
        case 'grid':
            return {
                name: 'grid',
                avoidOverlap: $wstate.settings.grid_settings.avoid_overlap,
                avoidOverlapPadding: $wstate.settings.grid_settings.avoid_overlap_padding
            }
        case 'circle':
            return {
                name: 'circle',
                avoidOverlap: $wstate.settings.circle_settings.avoid_overlap,
                clockwise: $wstate.settings.circle_settings.clockwise
            }
        case 'concentric':
            return {
                name: 'concentric',
                avoidOverlap: $wstate.settings.concentric_settings.avoid_overlap,
                clockwise: $wstate.settings.concentric_settings.clockwise,
                equidistant: $wstate.settings.concentric_settings.equidistant,
                minNodeSpacing: $wstate.settings.concentric_settings.min_node_spacing
            }
        case 'avsdf':
            return {
                name: 'avsdf',
                nodeSeparation: $wstate.settings.avsdf_settings.node_separation
            }
        case 'fcose':
            return {
                name: 'fcose',
                nodeSeparation: $wstate.settings.fcose_settings.node_separation,
                nodeRepulsion: $wstate.settings.fcose_settings.node_repulsion,
                idealEdgeLength: $wstate.settings.fcose_settings.ideal_edge_length,
            }
        case 'cise':
            return {
                name: 'cise',
                nodeSeparation: $wstate.settings.cise_settings.node_separation,
                nodeRepulsion: $wstate.settings.cise_settings.node_repulsion,
                idealEdgeLength: $wstate.settings.cise_settings.ideal_edge_length,
            }
    }
    // Layout currently not customizable - return default layout object
    return {name: $wstate.settings.layout}
});
// returns current style of the graph.
const graph_styles = computed((): any[] => {
    return [ // the stylesheet for the graph
        {
            selector: 'node',
            style: {
                'background-color': '#666',
                'label': 'data(id)',
                'width': (n) => scale.value.r(n.data('usage')),
                'height': (n) => scale.value.r(n.data('usage')),
            },
        },
        {
            selector: 'edge',
            style: {
                'width': (d) => scale.value.t(Math.abs(d.data('weight'))),
                'opacity': $wstate.settings.use_opacity ? (d) => Math.abs(scale.value.o(d.data('weight'))) : 1,
                'line-color': (d) => scale.value.z(d.data('weight')),
                'target-arrow-color': (d) => scale.value.z(d.data('weight')),
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
});
// returns Nodes of the Statemap given the current dataset.
const elements = computed((): any[] => {
    const trans = raw_data.value.transitions.filter((row) => row.group === $wstate.settings.plot_group);
    const transSum = trans.reduce((acc, curr) => acc + curr.raw, 0);
    const relTrans = raw_data.value.transitions.filter((row) => row.group === $wstate.settings.relative_diff_group);
    const relTransSum = relTrans.reduce((acc, curr) => acc + curr.raw, 0);

    const showRelDiff = $wstate.settings.show_relative_diff;
    if (trans === undefined || trans.length === 0) {
        return [];
    }
    if (showRelDiff && (relTrans === undefined || relTrans.length === 0)) {
        return [];
    }

    const elements = [] as (Node|Link)[];
    for (const s of dataview.value.selectedSyllables) {
        const n = raw_data.value.usages.find((row) => row.syllable === s);
        if (n !== undefined) {
            elements.push({
                data: {
                    type: 'node',
                    id: s,
                    name: s.toString(),
                    usage: n.usage,
                },
            } as Node);
        }
    }

    for (const [i, t] of trans.entries()) {
        if (dataview.value.selectedSyllables.includes(t.row_id) && dataview.value.selectedSyllables.includes(t.col_id)) {
            const val = (t.raw / transSum);
            if (showRelDiff && (t.row_id !== relTrans[i].row_id || t.col_id !== relTrans[i].col_id)) {
                /* tslint:disable-next-line:no-console */
                console.warn('primary and relative mismatch', t, relTrans[i]);
            }
            const relval = showRelDiff
                        ?  (t.raw / transSum) - (relTrans[i].raw / relTransSum)
                        : (t.raw / transSum);
            if (val > 0 && val > $wstate.settings.prune_threshold) {
                elements.push({
                    data: {
                        type: 'edge',
                        id: `${t.row_id}->${t.col_id}`,
                        source: t.row_id,
                        target: t.col_id,
                        weight: relval,
                    },
                } as Link);
            }
        }
    }
    return elements;
});
// returns scale of the graph.
const scale = computed((): any => {
    const r = scaleLinear()
                .domain(extent((raw_data.value.usages).map((n) => n.usage)) as [number, number])
                .range([5, 20]);

    const links = elements.value.filter((d) => d.data.type === 'edge')
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

        z = scaleDiverging(GetScale($wstate.settings.colorscale) as (t: number) => string)
                    .domain(transDomain  as [number, number, number]);
        zo = scaleDiverging(($wstate.settings.use_opacity ?
                                GetScaleWithOpacity($wstate.settings.colorscale, zo) :
                                GetScale($wstate.settings.colorscale)) as (t: number) => string)
                    .domain(transDomain  as [number, number, number]);
    } else {
        transDomain = [0, abstransMax] as [number, number];
        t = scaleLinear()
                    .domain(transDomain)
                    .range([1, 10]);

        o = scaleLinear()
                    .domain(transDomain)
                    .range([0, 1]);

        z = scaleSequential(GetScale($wstate.settings.colorscale) as (t: number) => string)
                    .domain(transDomain  as [number, number]);
        zo = scaleSequential(GetScaleWithOpacity($wstate.settings.colorscale, o))
                    .domain(transDomain as [number, number]);
    }
    return { r, t, o, z, zo };
});
// returns usage and transition of Nodes in the Source Data.
const sourceData = computed(() => {

    const showRelDiff = $wstate.settings.show_relative_diff;
    const relDiffGroup = $wstate.settings.relative_diff_group;

    const filterGroups = [...(showRelDiff ?
        [$wstate.settings.plot_group, relDiffGroup] : [$wstate.settings.plot_group])];

    const usageFilters: Operation[] = [
        {
            type: 'map',
            columns: [
                [`usage_${dataview.value.countMethod.toLowerCase()}`, 'usage'],
                ['group', 'group'],
                [`id_${dataview.value.countMethod.toLowerCase()}`, 'syllable'],
            ],
        },
        {
            type: 'filter',
            filters: {
                group: filterGroups,
                syllable: dataview.value.selectedSyllables,
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

    const transFilters: Operation[] = [
        {
            type: 'map',
            columns: [
                ['default_group', 'group'],
                [`row_id_${dataview.value.countMethod.toLowerCase()}`, 'row_id'],
                [`col_id_${dataview.value.countMethod.toLowerCase()}`, 'col_id'],
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
        usage: usageFilters,
        transitions: transFilters,
        is_valid: filterGroups.filter((g) => g !== '' && g !== undefined).length > 0,
    };
});



// returns the current node color.
function nodeColor(n) {
    return scale.value.r(n.data('usage'));
}
// returns the link color between 2 syllables.
function linkColor(l) {
    return scale.value.z(l.data('weight'));
                /*.replace('rgb', 'rgba')
                .replace(')', `, ${scale.value.o(Math.abs(l.data('weight')))})`)*/
}
// changes selected syllable to the node clicked.
function onNodeClick(event) {
    if (event.target && event.target._private.data.id) {
        dataview.value.selectedSyllable = Number.parseInt(event.target._private.data.id, 10);
    }
}
// returns snapshot of the current layout of the State Map.
function snapshot(options: SnapshotOptions): Promise<string> {
    
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
            if (!cy.value) {
                return Promise.reject('Cytoscape instance not initialized');
            }
            const svgStr = (cy.value as any).svg({
                bg: options.backgroundColor,
                full: false,
                scale: options.scale,
            });
            const legendDataURI = await targetToDataURI(legendHost.value as ComponentPublicInstance, options)
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
            if (!cy.value) {
                return Promise.reject('Cytoscape instance not initialized');
            }
            return cy.value.png({
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
            const graphContainer = container.value as HTMLDivElement;
            return {
                dataURI: graphURI,
                pos_x: 0,
                pos_y: 0,
                width: graphContainer.clientWidth * (window.devicePixelRatio || 1),
                height: graphContainer.clientHeight * (window.devicePixelRatio || 1),
            } as SubImage;
        })
        .then(async (graphSubImage: SubImage) => {
            const lel = legendHost.value?.$el as HTMLElement;
            const legend = {
                dataURI: await targetToDataURI(legendHost.value as ComponentPublicInstance, options),
                pos_x: 0,
                pos_y: graphSubImage.height,
                width: lel.clientWidth * (window.devicePixelRatio || 1),
                height: lel.clientHeight * (window.devicePixelRatio || 1),
            } as SubImage;
            return composite_images([graphSubImage, legend], options);
        });
    } else {
        throw Error('unsupported format: ' + options.format)
    }
}
function updateStyles() {
        if (!cy.value) {
            return;
        }
        cy.value.style(graph_styles.value);
    }
function generateLayout() {
    if (!cy.value) {
        return;
    }
    forceRedraw();
    cy.value.layout(graph_layout.value).run();
}
function forceRedraw() {
    if (!container.value) {
        return;
    }
    const el = container.value;
    const display = el.style.display;
    el.style.display = 'none';
    el.style.display = display;
}
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