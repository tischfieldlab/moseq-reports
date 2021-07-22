<template>
    <div style="width:100%">
        <b-card no-body>
            <template #header>
                <b-dropdown text="Add Operation" class="float-right add-op-button" size="sm">
                    <template v-for="op in operationTypes">
                        <b-dropdown-item @click="addOperation(op)" :key="op">{{op}}</b-dropdown-item>
                    </template>
                </b-dropdown>
                <h6 class="mb-0">Data Source</h6>
            </template>
            <b-form-select v-model="selectedDataset" :options="availableDataSources" />
        </b-card>

        <data-view :Dataset="intermediateResults[0]" :Collapsed="true" />

        <template v-for="(op, idx) in operations">
            <b-card :key="idx" :no-body="!cardHasBody(op.type)">
                <template #header>
                    <b-button-close @click="removeOperation(idx)" />
                    <!-- @click="is_expanded = !is_expanded"
                        :title="is_expanded ? 'Collapse' : 'Expand'"-->
                    <b-button
                        v-b-toggle="$id(`op-collapse-${idx}`)"
                        variant="link"
                        class="text-dark collapse-button text-decoration-none">
                        <b-icon class="when-opened" title="Collapse" icon="chevron-up"></b-icon>
                        <b-icon class="when-closed" title="Expand" icon="chevron-down"></b-icon>
                    </b-button>
                    <h6 class="mb-0" style="display:inline-block;">{{op.type}}</h6>
                </template>
                <b-collapse :visible="true" :id="$id(`op-collapse-${idx}`)">
                    <component v-if="cardHasBody(op.type)" :is="operationToComponent(op.type)" :Operation="op" :PreviousResult="intermediateResults[idx]" />
                </b-collapse>
                <!--Operation Type: <b-form-select  v-model="op.type" :options="operationTypes"></b-form-select> -->
            </b-card>
            <data-view :key="`dv-${idx+1}`" :Dataset="intermediateResults[idx+1]" :Collapsed="true" />
        </template>
    </div>
</template>



<script lang="ts">
import LoadingMixin from '@/components/Core/LoadingMixin'
import mixins from 'vue-typed-mixins';
import WindowMixin from '@/components/Core/WindowMixin';
import RegisterDataComponent from '@/components/Core';
import { RenderMode } from '@/store/datawindow.types';
import LoadData from '@/components/Core/DataLoader/DataLoader';
import { Operation, SortDirection } from '@/components/Core/DataLoader/DataLoader.types';

import {MapOperation, SortOperation, DataView, PluckOperation, FilterOperation, AggregateOperation} from './Operations';


RegisterDataComponent({
    friendly_name: 'Data Query',
    component_type: 'DataQuery',
    settings_type: 'DataQueryOptions',
    init_width: 400,
    init_height: 500,
    available_render_modes: [RenderMode.HTML],
    default_render_mode: RenderMode.HTML,
    default_settings: {},
});

export default mixins(LoadingMixin, WindowMixin).extend({
    components: {
        DataView,
        MapOperation,
        SortOperation,
        PluckOperation,
        FilterOperation,
        AggregateOperation,
    },
    data() {
        return {
            selectedDataset: '',
            operations: new Array<Operation>(),
            intermediateResults: [] as any,
            view: [],

            operationTypes: ['map', 'pluck', 'keys', 'sort', 'filter', 'aggregate']
        };
    },
    mounted(){
        // this.addOperation();
    },
    watch: {
        selectedDataset: {
            handler() {
                this.prepareData();
            },
        },
        operations: {
            handler() {
                this.prepareData();
            },
            deep: true,
        },
    },
    computed: {
        availableDataSources(): {text: string, value: string}[] {
            return this.getDataSourceItems(this.$store.state.datasets.manifest);
        },
    },
    methods: {
        cardHasBody(opType) {
            if (['keys'].includes(opType)) {
                return false;
            }
            return true;
        },
        operationToComponent(opType: string) {
            return opType.charAt(0).toUpperCase() + opType.slice(1) + 'Operation';
        },
        addOperation(opType) {
            const op = this.operationFactory(opType);
            if (op !== undefined) {
                this.operations.push(op);
            }
        },
        removeOperation(opIndex) {
            this.operations.splice(opIndex, 1);
        },
        operationFactory(opType: string): Operation|undefined {
            switch (opType) {
                case 'map':
                    return {
                        type: 'map',
                        columns: undefined,
                    };
                case 'pluck':
                    return {
                        type: 'pluck',
                        column: [],
                    };
                case 'keys':
                    return {
                        type: 'keys',
                    };
                case 'sort':
                    return {
                        type: 'sort',
                        columns: [],
                        direction: SortDirection.Asc,
                    };
                case 'filter':
                    return {
                        type: 'filter',
                        filters: {},
                    };
                case 'aggregate':
                    return {
                        type: 'aggregate',
                        groupby: [],
                        aggregate: {},
                    };
            }
        },
        prepareData(): void {
            const dset = this.$store.getters[`datasets/resolve`](this.selectedDataset);
            for (let i=0; i < this.operations.length+1; i++) {
                const ops = this.operations.slice(0, i);
                // console.log(i, ops);
                LoadData(dset, ops)
                    .then((data) => this.intermediateResults.splice(i, 1, data))
            }
        },
        getDataSourceItems(manifest, prefix='/'): {text: string, value: string}[] {
            const ignoreKeys = ['syllable_clips'];

            return Object.entries(manifest)
                .flatMap(([k, v]) => {
                    // console.log(k, v)
                    if (ignoreKeys.includes(k)){
                        return [];
                    } else if (typeof v === 'object') {
                        return this.getDataSourceItems(v, prefix=`${prefix}${k}/`);
                    } else {
                        return { text: `${prefix}${k}`, value: v as string };
                    }
                });
        },
    },
});
</script>

<style scoped>
.card {
    margin:0.75rem 1.75rem;
}
.add-op-button {
    margin-top: -0.375rem;
}
.collapse-button {
    padding: 0;
    margin-right: 1rem;
}
.collapsed > .when-opened,
:not(.collapsed) > .when-closed {
    display: none;
}
</style>