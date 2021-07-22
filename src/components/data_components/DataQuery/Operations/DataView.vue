<template>
<div style="margin:0.75rem 1.75rem;">
    <b-button
        @click="is_expanded = !is_expanded"
        :title="is_expanded ? 'Collapse' : 'Expand'"
        v-b-toggle="$id('filter-collapse')"
        variant="link"
        class="text-dark collapse-button text-decoration-none">
        <b-icon class="when-opened" title="Collapse" icon="chevron-up"></b-icon>
        <b-icon class="when-closed" title="Expand" icon="chevron-down"></b-icon>
    </b-button>
    Show results at this stage:
    <span class="datahint">{{datahint}}</span><br />
    <b-collapse :visible="is_expanded" :id="$id('filter-collapse')">
        <b-form-textarea :readonly="true" rows="5" v-model="formattedDataset" />
    </b-collapse>
</div>
</template>


<script lang="ts">
import Vue, { PropType } from 'vue';


export default Vue.extend({
    props: {
        Dataset: {
            required: false,
        },
        Collapsed: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            is_expanded: !this.Collapsed,
        };
    },
    watch: {
        Collapsed: {
            handler(): void {
                this.is_expanded = !this.Collapsed;
            },
        },
    },
    computed: {
        formattedDataset(): string {
            return JSON.stringify(this.Dataset, null, '\t');
        },
        datahint(): string {
            if (Array.isArray(this.Dataset)) {
                return `Array(${this.Dataset.length})`;
            }
            return typeof this.Dataset;
        }
    },
});
</script>

<style scoped>
.collapse-button {
    padding: 0;
}
.collapsed > .when-opened,
:not(.collapsed) > .when-closed {
    display: none;
}
textarea {
    font-family: 'Courier New', Courier, monospace;
    font-size: 10px;
}
.datahint {
    font-family: 'Courier New', Courier, monospace;
    color: #444;
}
</style>