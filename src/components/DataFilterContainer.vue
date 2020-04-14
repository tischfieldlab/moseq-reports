<template>
    <Portal>
        <div :class="{ 'button-bar': true, 'right': right }">
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
            shadow="lg"
            :width="`${width}px`">

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
        width: {
            type: Number,
            default: 250,
        },
    },
    data() {
        return {
            show_filters: true,
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
.filter_container {
    display: flex;
    flex-flow: column;
    height: 100%;
}
.filter_container > h3 {
    background: #c5c5c5;
    padding: 10px;
    margin-bottom: 0;
    font-size: 1.5em;
}
.filter_container > div {
    flex-grow : 1;
    overflow-y: auto;
    overflow-x: hidden;
}
.button-bar {
    display: flex;
    position: fixed;
    justify-content: center;
    padding-top: 12px;
    width: 48px;
    top: 0;
    bottom: 0;
    background-color: #ffffff;
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
.b-sidebar:not(.b-sidebar-right) {
    left: 48px;
}
.b-sidebar.b-sidebar-right {
    right: 48px;
}
</style>