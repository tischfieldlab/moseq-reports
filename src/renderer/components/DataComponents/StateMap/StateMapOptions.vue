<template>
    <BContainer fluid>
        <BRow>
            <BCol>
                <BInputGroup prepend="Group to plot">
                    <BFormSelect v-model="plot_group" :options="available_groups"></BFormSelect>
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow>
            <BCol>
                <BFormCheckbox switch v-model="show_relative_diff">Show Relative Differences</BFormCheckbox>
            </BCol>
        </BRow>
        <BRow v-show="show_relative_diff">
            <BCol cols="1"></BCol>
            <BCol>
                <BInputGroup prepend="Relative To Group">
                    <BFormSelect v-model="relative_diff_group" :options="available_diff_groups"></BFormSelect>
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow>
            <BCol>
                <BInputGroup prepend="Prune Transitions Threshold">
                    <BFormInput v-model="prune_threshold" type="number" :number="true" step="0.001" min="0" max="1" />
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow>
            <BCol>
                <BInputGroup prepend="Layout">
                    <BFormSelect v-model="layout" :options="available_layouts"></BFormSelect>
                </BInputGroup>
            </BCol>
        </BRow>
        <!-- grid layout settings -->
        <BRow v-if="layout === 'grid'">
            <BCol cols="1"></BCol>
            <BCol>
                <BFormCheckbox switch v-model="grid_avoid_overlap">Avoid Overlap</BFormCheckbox>
            </BCol>
        </BRow>
        <BRow v-if="layout === 'grid' && grid_avoid_overlap === true">
            <BCol cols="2"></BCol>
            <BCol>
                <BInputGroup prepend="Avoid Overlap Padding">
                    <BFormInput v-model="grid_avoid_overlap_padding" type="number" :number="true" step="10" min="0" max="150"/>
                </BInputGroup>
            </BCol>
        </BRow>
        <!-- circle layout settings -->
        <BRow v-if="layout === 'circle'">
            <BCol cols="1"></BCol>
            <BCol>
                <BFormCheckbox switch v-model="circle_avoid_overlap">Avoid Overlap</BFormCheckbox>
            </BCol>
        </BRow>
        <BRow v-if="layout === 'circle'">
            <BCol cols="1"></BCol>
            <BCol>
                <BFormCheckbox switch v-model="circle_clockwise">Clockwise</BFormCheckbox>
            </BCol>
        </BRow>
        <!-- concentric layout settings -->
        <BRow v-if="layout === 'concentric'">
            <BCol cols="1"></BCol>
            <BCol>
                <BFormCheckbox switch v-model="concentric_avoid_overlap">Avoid Overlap</BFormCheckbox>
            </BCol>
        </BRow>
        <BRow v-if="layout === 'concentric'">
            <BCol cols="1"></BCol>
            <BCol>
                <BFormCheckbox switch v-model="concentric_clockwise">Clockwise</BFormCheckbox>
            </BCol>
        </BRow>
        <BRow v-if="layout === 'concentric'">
            <BCol cols="1"></BCol>
            <BCol>
                <BFormCheckbox switch v-model="concentric_equidistant">Equidistant</BFormCheckbox>
            </BCol>
        </BRow>
        <BRow v-if="layout === 'concentric'">
            <BCol cols="1"></BCol>
            <BCol>
                <BInputGroup prepend="Minimum Node Spacing">
                    <BFormInput v-model="concentric_min_node_spacing" type="number" :number="true" step="10" min="0" max="100"/>
                </BInputGroup>
            </BCol>
        </BRow>
        <!-- avsdf layout settings -->
        <BRow v-if="layout === 'avsdf'">
            <BCol cols="1"></BCol>
            <BCol>
                <BInputGroup prepend="Node Separation">
                    <BFormInput v-model="avsdf_node_separation" type="number" :number="true" step="10" min="0" max="200"/>
                </BInputGroup>
            </BCol>
        </BRow>
        <!-- fcose layout settings -->
        <BRow v-if="layout === 'fcose'">
            <BCol cols="1"></BCol>
            <BCol>
                <BInputGroup prepend="Node Separation">
                    <BFormInput v-model="fcose_node_separation" type="number" :number="true" step="10" min="0" max="1000"/>
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow v-if="layout === 'fcose'">
            <BCol cols="1"></BCol>
            <BCol>
                <BInputGroup prepend="Node Repulsion">
                    <BFormInput v-model="fcose_node_repulsion" type="number" :number="true" step="100" min="0" max="10000"/>
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow v-if="layout === 'fcose'">
            <BCol cols="1"></BCol>
            <BCol>
                <BInputGroup prepend="Ideal Edge Length">
                    <BFormInput v-model="fcose_ideal_edge_length" type="number" :number="true" step="5" min="0" max="100"/>
                </BInputGroup>
            </BCol>
        </BRow>
        <!-- cise layout settings -->
        <BRow v-if="layout === 'cise'">
            <BCol cols="1"></BCol>
            <BCol>
                <BInputGroup prepend="Node Separation">
                    <BFormInput v-model="cise_node_separation" type="number" :number="true" step="1" min="0" max="100"/>
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow v-if="layout === 'cise'">
            <BCol cols="1"></BCol>
            <BCol>
                <BInputGroup prepend="Node Repulsion">
                    <BFormInput v-model="cise_node_repulsion" type="number" :number="true" step="1" min="0" max="100"/>
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow v-if="layout === 'cise'">
            <BCol cols="1"></BCol>
            <BCol>
                <BInputGroup prepend="Ideal Edge Length">
                    <BFormInput v-model="cise_ideal_edge_length" type="number" :number="true" step="1" min="0" max="100"/>
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow>
            <BCol>
                <BInputGroup prepend="Colormap" style="flex-wrap:nowrap">
                    <ColorScalePicker v-model="colorscale" />
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow>
            <BCol>
                <BFormCheckbox switch v-model="use_opacity">Use Transparency</BFormCheckbox>
            </BCol>
        </BRow>
    </BContainer>
</template>

<script setup lang="ts">
import ColorScalePicker from '@render/components/Charts/Colors/ColorScalePicker.vue';
import { useWindowMixin } from '@render/components/Core/Window/WindowMixin';
import { StateMapSettings } from './StateMap.types';
import { computed } from 'vue';


const props = defineProps<{
    id: string;
}>();

const {$wstate, dataview, datasource} = useWindowMixin<StateMapSettings>(props.id);

const available_layouts = [
    'grid', 'circle', 'concentric', 'avsdf', 'fcose', 'cise',
];


// Return current non filtered groups.
const available_groups = computed((): {text: string, value: string}[] => {
    return dataview.selectedGroups.map((g) => ({text: g, value: g}));
});
const available_diff_groups = computed((): any[] => {
    return dataview.selectedGroups
            .map((g) => ({text: g, value: g}))
            .filter((el) => el.value !== plot_group.value);
});
// returns the plot group of the current dataset. If changed, value can be updated by committing the `updateComponentSettings` mutation.
const plot_group = computed({
    get(): string {
        return $wstate.settings.plot_group;
    },
    set(value: string) {
        $wstate.updateComponentSettings({
            settings: {
                plot_group: value,
            },
        });
    },
})
// Boolean that determines whether to display relative difference.
const show_relative_diff = computed({
    get(): boolean {
        return $wstate.settings.show_relative_diff;
    },
    set(value: boolean) {
        $wstate.updateComponentSettings({
            settings: {
                show_relative_diff: value,
            },
        });
    },
});
// Boolean to determine whether to display relative different groups.
const relative_diff_group = computed({
    get(): string {
        return $wstate.settings.relative_diff_group;
    },
    set(value: string) {
        $wstate.updateComponentSettings({
            settings: {
                relative_diff_group: value,
            },
        });
    },
});
// Returns numerical value for prune threshold. If changed, value can be updated by committing the `updateComponentSettings` mutation.
const prune_threshold = computed({
    get(): number {
        return $wstate.settings.prune_threshold;
    },
    set(value: number) {
        $wstate.updateComponentSettings({
            settings: {
                prune_threshold: value,
            },
        });
    },
});
const layout = computed({
    get(): string {
        return $wstate.settings.layout;
    },
    set(value: string) {
        $wstate.updateComponentSettings({
            settings: {
                layout: value,
            },
        });
    },
});
const colorscale = computed({
    get(): string {
        return $wstate.settings.colorscale;
    },
    set(value: string) {
        $wstate.updateComponentSettings({
            settings: {
                colorscale: value,
            },
        });
    },
});
const use_opacity = computed({
    get(): boolean {
        return $wstate.settings.use_opacity;
    },
    set(value: boolean) {
        $wstate.updateComponentSettings({
            settings: {
                use_opacity: value,
            },
        });
    },
});
// grid
const grid_avoid_overlap = computed({
    get(): boolean {
        return $wstate.settings.grid_settings.avoid_overlap;
    },
    set(value: boolean) {
        $wstate.updateComponentSettings({
            settings: {
                grid_settings: {
                    avoid_overlap: value,
                }
            },
        });
    }
});
const grid_avoid_overlap_padding = computed({
    get(): number {
        return $wstate.settings.grid_settings.avoid_overlap_padding;
    },
    set(value: number) {
        $wstate.updateComponentSettings({
            settings: {
                grid_settings: {
                    avoid_overlap_padding: value,
                }
            },
        });
    }
});
// circle
const circle_avoid_overlap = computed({
    get(): boolean {
        return $wstate.settings.circle_settings.avoid_overlap;
    },
    set(value: boolean) {
        $wstate.updateComponentSettings({
            settings: {
                circle_settings: {
                    avoid_overlap: value,
                }
            },
        });
    }
});
const circle_clockwise = computed({
    get(): boolean {
        return $wstate.settings.circle_settings.clockwise;
    },
    set(value: boolean) {
        $wstate.updateComponentSettings({
            settings: {
                circle_settings: {
                    clockwise: value,
                }
            },
        });
    }
});
// concentric
const concentric_avoid_overlap = computed({
    get(): boolean {
        return $wstate.settings.concentric_settings.avoid_overlap;
    },
    set(value: boolean) {
        $wstate.updateComponentSettings({
            settings: {
                concentric_settings: {
                    avoid_overlap: value,
                }
            },
        });
    }
});
const concentric_clockwise = computed({
    get(): boolean {
        return $wstate.settings.concentric_settings.clockwise;
    },
    set(value: boolean) {
        $wstate.updateComponentSettings({
            settings: {
                concentric_settings: {
                    clockwise: value,
                }
            },
        });
    }
});

const concentric_equidistant = computed({
    get(): boolean {
        return $wstate.settings.concentric_settings.equidistant;
    },
    set(value: boolean) {
        $wstate.updateComponentSettings({
            settings: {
                concentric_settings: {
                    equidistant: value,
                }
            },
        });
    }
});
const concentric_min_node_spacing = computed({
    get(): number {
        return $wstate.settings.concentric_settings.min_node_spacing;
    },
    set(value: number) {
        $wstate.updateComponentSettings({
            settings: {
                concentric_settings: {
                    min_node_spacing: value,
                }
            },
        });
    },
});
// avsdf
const avsdf_node_separation = computed({
    get(): number {
        return $wstate.settings.avsdf_settings.node_separation;
    },
    set(value: number) {
        $wstate.updateComponentSettings({
            settings: {
                avsdf_settings: {
                    node_separation: value,
                }
            },
        });
    },
});
// fcose
const fcose_node_separation = computed({
    get(): number {
        return $wstate.settings.fcose_settings.node_separation;
    },
    set(value: number) {
        $wstate.updateComponentSettings({
            settings: {
                fcose_settings: {
                    node_separation: value,
                }
            },
        });
    },
});
const fcose_node_repulsion = computed({
    get(): number {
        return $wstate.settings.fcose_settings.node_repulsion;
    },
    set(value: number) {
        $wstate.updateComponentSettings({
            settings: {
                fcose_settings: {
                    node_repulsion: value,
                }
            },
        });
    },
});
const fcose_ideal_edge_length = computed({
    get(): number {
        return $wstate.settings.fcose_settings.ideal_edge_length;
    },
    set(value: number) {
        $wstate.updateComponentSettings({
            settings: {
                fcose_settings: {
                    ideal_edge_length: value,
                }
            },
        });
    },
});
// cise
const cise_node_separation = computed({
    get(): number {
        return $wstate.settings.cise_settings.node_separation;
    },
    set(value: number) {
        $wstate.updateComponentSettings({
            settings: {
                cise_settings: {
                    node_separation: value,
                }
            },
        });
    },
});
const cise_node_repulsion = computed({
    get(): number {
        return $wstate.settings.cise_settings.node_repulsion;
    },
    set(value: number) {
        $wstate.updateComponentSettings({
            settings: {
                cise_settings: {
                    node_repulsion: value,
                }
            },
        });
    },
});
const cise_ideal_edge_length = computed({
    get(): number {
        return $wstate.settings.cise_settings.ideal_edge_length;
    },
    set(value: number) {
        $wstate.updateComponentSettings({
            settings: {
                cise_settings: {
                    ideal_edge_length: value,
                }
            },
        });
    },
});

</script>

<style scoped>
.row {
    margin:10px 0;
}
</style>