<template>
    <Portal>
        <div :class="{ 'button-bar': true, 'shadow-lg': !show_filters, 'right': right }">
            <b-icon
                title="Data Filters"
                :class="{ active: show_filters }"
                :icon="show_filters ? 'funnel-fill' : 'funnel'"
                v-on:click="toggle_filters"></b-icon>
        </div>
        <b-sidebar id="sidebar-1"
            :visible="show_filters"
            @change="sidebar_visibility_changed"
            no-header
            title="Data Filters"
            :right="right"
            shadow="lg">

            <div>
                <template v-for="ns in filters">
                    <DataFilter :key="ns" :datasource="ns" />
                </template>
            </div>
        </b-sidebar>
    </Portal>
</template>


<script lang="ts">
import Vue from 'vue';
import DataFilter from '@/components/DataFilter.vue';
import { Portal } from '@linusborg/vue-simple-portal';

export default Vue.extend({
    components: {
        Portal,
        DataFilter,
    },
    props: {
        right: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            show_filters: false,
        };
    },
    computed: {
        filters(): string[] {
            return this.$store.state.filters.items;
        },
    },
    created() {
        if (this.filters.length === 0) {
            this.$store.dispatch('filters/addFilter');
        }
    },
    methods: {
        toggle_filters() {
            this.show_filters = !this.show_filters;
        },
        sidebar_visibility_changed(visibility: boolean) {
            this.show_filters = visibility;
        },
    },
});
</script>

<style scoped>
.button-bar {
    display: flex;
    position: fixed;
    justify-content: center;
    padding-top: 12px;
    width: 48px;
    top: 30px;
    bottom: 0;
    background-color: #f8f9fa;
    z-index: 1050;
}
.button-bar.right {
    right: 0;
}
.button-bar .b-icon {
    width: 48px;
    height: 48px;
    padding: 6px;
    cursor: pointer;
}
.button-bar:not(.right) .b-icon.active {
    border-left: 3px solid #2c3e50;
}
.button-bar.right .b-icon.active {
    border-right: 3px solid #2c3e50;
}
.b-sidebar {
    top:30px;
}
.b-sidebar:not(.b-sidebar-right) {
    left: 48px;
}
.b-sidebar.b-sidebar-right {
    right: 48px;
}
</style>