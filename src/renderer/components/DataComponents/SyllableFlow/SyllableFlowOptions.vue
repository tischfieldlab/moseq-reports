<template>
    <BContainer fluid>
        <BRow>
            <BCol>
                <BInputGroup prepend="Group to plot">
                    <BFormSelect v-model="plot_group" :options="available_groups" />
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
                    <BFormSelect v-model="relative_diff_group" :options="available_diff_groups" />
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow v-show="show_relative_diff">
            <BCol cols="1"></BCol>
            <BCol>
                <BInputGroup prepend="Colormap" style="flex-wrap:nowrap">
                    <ColorScalePicker v-model="colorscale" />
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
                <BInputGroup prepend="Node Alignment">
                    <BFormSelect v-model="node_alignment" :options="alignment_options" />
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow>
            <BCol>
                <BInputGroup prepend="Node Width">
                    <BFormInput v-model.number="node_width" type="number" :number="true" step="1" min="5" max="50" />
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow>
            <BCol>
                <BInputGroup prepend="Node Padding">
                    <BFormInput v-model.number="node_padding" type="number" :number="true" step="1" min="0" max="50" />
                </BInputGroup>
            </BCol>
        </BRow>
    </BContainer>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useWindowMixin } from '@render/components/Core/Window/WindowMixin';
import ColorScalePicker from '@render/components/Charts/Colors/ColorScalePicker.vue';
import { SyllableFlowSettings} from './SyllableFlow.types';
import { NodeAlignment } from '@render/components/Charts/Sankey/Sankey.types';

const props = defineProps<{ id: string }>();
const { $wstate, dataview } = useWindowMixin<SyllableFlowSettings>(props.id);

const available_groups = computed(() => dataview.value.selectedGroups.map((g) => ({ text: g, value: g })));

const plot_group = computed({
    get: () => $wstate.settings.plot_group,
    set: (val: string) => $wstate.updateComponentSettings({ settings: { plot_group: val } }),
});

const show_relative_diff = computed({
    get: () => $wstate.settings.show_relative_diff,
    set: (val: boolean) => $wstate.updateComponentSettings({ settings: { show_relative_diff: val } }),
});

const available_diff_groups = computed(() =>
    dataview.value.selectedGroups
        .map((g) => ({ text: g, value: g }))
        .filter((el) => el.value !== plot_group.value)
);

const relative_diff_group = computed({
    get: () => $wstate.settings.relative_diff_group,
    set: (val: string) => $wstate.updateComponentSettings({ settings: { relative_diff_group: val } }),
});

const colorscale = computed({
    get: () => $wstate.settings.colorscale,
    set: (val: string) => $wstate.updateComponentSettings({ settings: { colorscale: val } }),
});

const prune_threshold = computed({
    get: () => $wstate.settings.prune_threshold,
    set: (val: number) => $wstate.updateComponentSettings({ settings: { prune_threshold: val } }),
});

const node_alignment = computed({
    get: () => $wstate.settings.node_alignment,
    set: (val: NodeAlignment) => $wstate.updateComponentSettings({ settings: { node_alignment: val } }),
});

const node_width = computed({
    get: () => $wstate.settings.node_width,
    set: (val: number) => $wstate.updateComponentSettings({ settings: { node_width: val } }),
});

const node_padding = computed({
    get: () => $wstate.settings.node_padding,
    set: (val: number) => $wstate.updateComponentSettings({ settings: { node_padding: val } }),
});

const alignment_options = [
    { text: NodeAlignment.Justify, value: NodeAlignment.Justify },
    { text: NodeAlignment.Left, value: NodeAlignment.Left },
    { text: NodeAlignment.Right, value: NodeAlignment.Right },
    { text: NodeAlignment.Center, value: NodeAlignment.Center },
];
</script>

<style scoped>
.row {
    margin: 10px 0;
}
</style>
