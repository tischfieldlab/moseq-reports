<template>
<div class="sample-viewer-container">
    <b-input-group size="sm">
        <b-input-group-prepend is-text>
            <b-icon icon="search" />
        </b-input-group-prepend>
        <b-form-input type="text" v-model="filter_string" placeholder="Filter" ></b-form-input>
        <template v-slot:append>
            <b-button variant="info" @click="filter_string = ''" title="Clear Filters">
                <b-icon icon="x" />
            </b-button>
        </template>
    </b-input-group>
    <b-table
        data-snapshot-target
        style="width:100%;height:calc(100%-31px);"
        :items="items"
        :fields="fields"
        :filter="filter_string"
        :striped="true"
        :hover="true"
        :sticky-header="`${this.layout.height - 31 - 31}px`"
        ></b-table>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import mixins from 'vue-typed-mixins';
import WindowMixin from '@/components/Core/Window/WindowMixin';
import LoadData from '@/components/Core/DataLoader/DataLoader';
import RegisterDataComponent from '@/components/Core';
import { RenderMode } from '@/store/datawindow.types';


RegisterDataComponent({
    friendly_name: 'Sample Viewer',
    component_type: 'SampleViewer',
    settings_type: undefined,
    init_width: 400,
    init_height: 500,
    available_render_modes: [RenderMode.HTML],
    default_render_mode: RenderMode.HTML,
    default_settings: {},
});

export default mixins(WindowMixin).extend({
    data() {
        return {
            items: [] as any[],
            filter_string: '',
            fields: [
                { key: 'uuid', label: 'UUID', sortable: true, },
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
            ],
        };
    },
    watch: {
        sourceData: {
            async handler(newValue) {
                if (newValue === undefined) {
                    return;
                }
                this.items = await LoadData(newValue.source, newValue.filters, false)
                    .then((data) => {
                        data.forEach((itm) => { itm.uuid = itm.uuid.split('-').pop() });
                        return data;
                    });
            },
            immediate: true,
        },
    },
    computed:{
        sourceData(): any {
            const source = this.$store.getters[`datasets/resolve`]('samples');
            const filters = [
                {
                    type: 'map',
                    columns: undefined,
                },
            ];
            return {source, filters};
        }
    },
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
.b-table-sticky-header >>> .table.b-table > thead > tr > th {
    top: -1px;
}
</style>
