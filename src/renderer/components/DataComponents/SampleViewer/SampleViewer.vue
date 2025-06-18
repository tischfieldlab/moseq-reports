<template>
<div class="sample-viewer-container">
    <BInputGroup size="sm">
        <BInputGroupText>
            <IBiSearch />
        </BInputGroupText>
        <BFormInput type="text" v-model="filter_string" placeholder="Filter" />
        <BInputGroupText>
            <BButton variant="info" class="btn-close" @click="filter_string = ''" title="Clear Filters" />
        </BInputGroupText>
    </BInputGroup>
    <b-table
        data-snapshot-target
        style="width:100%;height:calc(100%-31);"
        :items="items"
        :fields="fields"
        :filter="filter_string"
        :striped="true"
        :hover="true"
        :small="true"
        :sticky-header="`${layout.height - 31}px`"
        ></b-table>
</div>
</template>

<script lang="ts">
RegisterDataComponent({
    friendly_name: 'Sample Viewer',
    component_type: 'SampleViewer',
    settings_type: undefined,
    init_width: 750,
    init_height: 300,
    available_render_modes: [RenderMode.HTML],
    default_render_mode: RenderMode.HTML,
    default_settings: {},
});
</script>
<script setup lang="ts">
import { ref, shallowRef, watchEffect } from 'vue';
import RegisterDataComponent from '@render/components/Core';
import { RenderMode } from '@store/datawindow.types';
import { useWindowMixin } from '@render/components/Core/Window/WindowMixin';
import DataService, { Operation } from '@render/api';

const props = defineProps<{
    id: string;
}>();

interface SampleViewerSettings {
    // Define any specific settings for the SampleViewer if needed
}
const {layout, dataview} = useWindowMixin<SampleViewerSettings>(props.id);



const fields = shallowRef([
    { key: 'uuid', label: 'UUID', sortable: true },
    { key: 'default_group', label: 'Group', sortable: true },
    { key: 'ApparatusName', label: 'Apparatus', sortable: true },
    { key: 'SessionName', label: 'Session Name', sortable: true },
    { key: 'SubjectName', label: 'Subject Name', sortable: true },
    {
        key: 'StartTime',
        label: 'Acquisition Time',
        sortable: true,
        formatter: (value) => new Date(value).toLocaleString()
    },
]);
const filter_string = ref<string>('');
const items = ref<any[]>([]);

interface DataItem {
    uuid: string;
    default_group: string;
    ApparatusName: string;
    SessionName: string;
    SubjectName: string;
    StartTime: string;
}

watchEffect(() => {
    const operations: Operation[] = [
        {
            type: 'map',
            columns: undefined,
        }, {
            type: 'filter',
            filters: {
                default_group: dataview.value.selectedGroups,
            },
        },
    ];
    DataService.fetchData<DataItem[]>('samples', operations, false)
        .then((data) => {
            data.forEach((itm) => { itm.uuid = itm.uuid.split('-').pop() as string; });
            items.value = data;
        });
});
</script>

<style scoped>
.sample-viewer-container {
    width: 100%;
    max-width: 100%;
    height: 100%;
    overflow: hidden;
}
.b-table-sticky-header {
    margin-bottom: 0;
}
.b-table-sticky-header :deep(.table.b-table > thead > tr > th) {
    top: -1px;
}
:deep(.table > thead) {
    font-size: 14px;
}
:deep(.table > tbody) {
    font-size: 12px;
}
</style>