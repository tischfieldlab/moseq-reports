<template>
    <b-table
        :items="items"
        :fields="fields"
        striped="true"
        hover="true"
        :sticky-header="`${this.layout.height - 31}px`"
        ></b-table>
</template>

<script lang="ts">
import Vue from 'vue';
import mixins from 'vue-typed-mixins';
import WindowMixin from '@/components/Core/WindowMixin';
import LoadData from '@/components/Core/DataLoader/DataLoader';
import RegisterDataComponent from '@/components/Core';


RegisterDataComponent({
    friendly_name: 'Sample Viewer',
    component_type: 'SampleViewer',
    settings_type: undefined,
    init_width: 400,
    init_height: 500,
    default_settings: {
        
    },
});

export default mixins(WindowMixin).extend({
    data() {
        return {
            items: [] as any[],
            fields: [
                { key: 'uuid', label: 'UUID', sortable: false, },
                { key: 'default_group', label: 'Group', sortable: true },
                { key: 'ApparatusName', label: 'Apparatus', sortable: true },
                { key: 'SessionName', label: 'Session Name', sortable: true },
                { key: 'SubjectName', label: 'Subject Name', sortable: true },
                { key: 'StartTime', label: 'Acquisition Time', sortable: true, formatter: (value) => new Date(value).toLocaleString() },
            ],
        };
    },
    watch: {
        sourceData: {
            async handler(newValue) {
                if (newValue === undefined) {
                    return;
                }
                this.items = await LoadData(newValue.source, newValue.filters, false);
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