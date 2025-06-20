<template>
    <Sankey
        :width="layout.width"
        :height="layout.height"
        :data="graph"
        :title="plotTitle"
        :colorLegendTitle="colorLegendTitle"
        :noDataMessage="noDataMessage"
        :tooltipFormatter="tooltipFormatter"
        :nodeIdSuperset="activeSyllables"
        :nodeAlignment="settings.node_alignment"
        :nodeWidth="settings.node_width"
        :nodePadding="settings.node_padding"
        :nodeColorMode="nodeColoring.mode"
        :nodeColorProperty="nodeColoring.prop"
        :linkColorMode="linkColoring.mode"
        :linkColorProperty="linkColoring.prop"
        :categoricalColormap="'schemeDark2'"
        :quantitativeColormap="settings.colorscale"
        @node-click="onNodeClick"
    />
</template>

<script lang="ts">
import { defineComponent, shallowRef, computed, watchEffect, onMounted } from 'vue';
import RegisterDataComponent from '@render/components/Core';
import { useWindowMixin } from '@render/components/Core/Window/WindowMixin';
import Sankey from '@render/components/Charts/Sankey/Sankey.vue';
import { Node, Link, NodeAlignment, ColoringMode } from '@render/components/Charts/Sankey/Sankey.types';
import { RenderMode } from '@render/store/datawindow.types';
import { SyllableFlowSettings, TransitionItem } from './SyllableFlow.types';
import DataService, { Operation } from '@api';


RegisterDataComponent({
    friendly_name: 'Syllable Flow',
    component_type: 'SyllableFlow',
    settings_type: 'SyllableFlowOptions',
    init_width: 400,
    init_height: 500,
    available_render_modes: [RenderMode.SVG],
    default_render_mode: RenderMode.SVG,
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

export default defineComponent({
    name: 'SyllableFlow',
    components: {
        Sankey,
    },
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const { $wstate, layout, dataview, settings } = useWindowMixin<SyllableFlowSettings>(props.id);

        const SyllableData = shallowRef<TransitionItem[]>([]);
        const selectedSyllable = computed({
            get: () => dataview.value.selectedSyllable,
            set: (val: number) => {
                dataview.value.selectedSyllable = val;
            },
        });

        const activeSyllables = computed(() => dataview.value.selectedSyllables.map((s) => s.toString()));

        const sourceData = computed(() => {
            const relDiffGroup = settings.value.relative_diff_group;
            const filterGroups = settings.value.show_relative_diff
                ? [settings.value.plot_group, relDiffGroup]
                : [settings.value.plot_group];

            const transFilters: Operation[] = [
                {
                    type: 'map',
                    columns: [
                        ['default_group', 'group'],
                        [`row_id_${dataview.value.countMethod.toLowerCase()}`, 'row_id'],
                        [`col_id_${dataview.value.countMethod.toLowerCase()}`, 'col_id'],
                        'raw',
                    ],
                },
                {
                    type: 'filter',
                    filters: {
                        group: filterGroups,
                    },
                },
                {
                    type: 'aggregate',
                    groupby: ['group', 'row_id', 'col_id'],
                    aggregate: {
                        raw: 'sum',
                    },
                },
                {
                    type: 'sort',
                    columns: [
                        ['row_id', 'asc'],
                        ['col_id', 'asc'],
                    ],
                },
            ];

            return {
                transFilters,
                is_valid: filterGroups.filter((g) => g !== '' && g !== undefined).length > 0,
            };
        });

        const graph = computed(() => {
            const trans = SyllableData.value.filter((row) => row.group === settings.value.plot_group);
            const transSum = trans.reduce((acc, curr) => acc + curr.raw, 0);
            const relTrans = SyllableData.value.filter((row) => row.group === settings.value.relative_diff_group);
            const relTransSum = relTrans.reduce((acc, curr) => acc + curr.raw, 0);

            const g = { nodes: [] as Node[], links: [] as Link[] };
            if (trans.length === 0 || (settings.value.show_relative_diff && relTrans.length === 0)) {
                return g;
            }

            g.nodes.push({
                type: 'node',
                id: selectedSyllable.value,
                name: selectedSyllable.value.toString(),
            });

            // Incoming links
            trans
                .filter((row) => row.col_id === selectedSyllable.value)
                .forEach((t) => {
                    if (activeSyllables.value.includes(t.row_id.toString()) && t.row_id !== selectedSyllable.value) {
                        const val = t.raw / transSum;
                        if (val > settings.value.prune_threshold) {
                            const inName = `in-${t.row_id}`;
                            g.nodes.push({
                                type: 'node',
                                id: t.row_id,
                                name: inName,
                            });
                            const relRow = relTrans.find(
                                (r) => r.row_id === t.row_id && r.col_id === t.col_id
                            );
                            const relval = settings.value.show_relative_diff
                                ? val - (relRow ? relRow.raw / relTransSum : 0)
                                : val;
                            g.links.push({
                                type: 'edge',
                                id: `${t.row_id} → ${selectedSyllable.value}`,
                                color_id: t.row_id,
                                source: inName,
                                target: selectedSyllable.value.toString(),
                                value: val,
                                real_value: relval,
                            });
                        }
                    }
                });

            // Outgoing links
            trans
                .filter((row) => row.row_id === selectedSyllable.value)
                .forEach((t) => {
                    if (activeSyllables.value.includes(t.col_id.toString()) && t.col_id !== selectedSyllable.value) {
                        const val = t.raw / transSum;
                        if (val > settings.value.prune_threshold) {
                            const outName = `out-${t.col_id}`;
                            g.nodes.push({
                                type: 'node',
                                id: t.col_id,
                                name: outName,
                            });
                            const relRow = relTrans.find(
                                (r) => r.row_id === t.row_id && r.col_id === t.col_id
                            );
                            const relval = settings.value.show_relative_diff
                                ? val - (relRow ? relRow.raw / relTransSum : 0)
                                : val;
                            g.links.push({
                                type: 'edge',
                                id: `${selectedSyllable.value} → ${t.col_id}`,
                                color_id: t.col_id,
                                source: selectedSyllable.value.toString(),
                                target: outName,
                                value: val,
                                real_value: relval,
                            });
                        }
                    }
                });
            return g;
        });

        const nodeColoring = computed(() => ({
            mode: ColoringMode.Categorical,
            prop: 'id',
        }));

        const linkColoring = computed(() => {
            if (settings.value.show_relative_diff) {
                return {
                    mode: ColoringMode.Quantitative,
                    prop: 'real_value',
                };
            } else {
                return {
                    mode: ColoringMode.Categorical,
                    prop: 'color_id',
                };
            }
        });

        const noDataMessage = computed(() => {
            return `No transitions for group ${settings.value.plot_group} Syllable ${selectedSyllable.value} (${dataview.value.countMethod})`;
        });

        const colorLegendTitle = computed(() => {
            if (settings.value.show_relative_diff) {
                return `TP(${settings.value.plot_group}) - TP(${settings.value.relative_diff_group})`;
            } else {
                return `TP(${settings.value.plot_group})`;
            }
        });

        const plotTitle = computed(() => {
            let title = settings.value.plot_group;
            if (settings.value.show_relative_diff) {
                title += ` vs ${settings.value.relative_diff_group}`;
            }
            return `${title} Syllable ${selectedSyllable.value} (${dataview.value.countMethod})`;
        });

        const tooltipFormatter = (hoverItem: Node | Link) => {
            if (hoverItem !== undefined) {
                if (hoverItem.type === 'node') {
                    return `Syllable ${hoverItem.id}`;
                } else if (hoverItem.type === 'edge') {
                    return `Transition ${hoverItem.id}<br />P(t) = ${(hoverItem as Link).value.toExponential(3)}`;
                }
            }
            return '';
        };

        const onNodeClick = (event: { value: { id: number } }) => {
            selectedSyllable.value = event.value.id;
        };
        watchEffect(async () => {
            try {
                const data = await DataService.fetchData('transitions', sourceData.value.transFilters);
                SyllableData.value = data as TransitionItem[];
            } catch (error) {
                console.error('Error fetching transition data:', error);
                SyllableData.value = [];
            }
        });
        onMounted(() => {
            if (!settings.value.plot_group) {
                $wstate.updateComponentSettings({
                    settings: {
                        plot_group: dataview.value.selectedGroups[0],
                    },
                });
            }
            if (!settings.value.relative_diff_group) {
                $wstate.updateComponentSettings({
                    settings: {
                        relative_diff_group: dataview.value.selectedGroups[1],
                    },
                });
            }
        });

        return {
            layout,
            settings,
            graph,
            nodeColoring,
            linkColoring,
            noDataMessage,
            colorLegendTitle,
            plotTitle,
            tooltipFormatter,
            activeSyllables,
            onNodeClick,
        };
    },
});
</script>
