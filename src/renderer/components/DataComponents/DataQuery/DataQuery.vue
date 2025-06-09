<template>
    <div class="wrapper" :style="{width: layout.width + 'px', height: layout.height + 'px'}">
        <BCard no-body>
            <template #header>
                <BDropdown text="Add Operation" class="float-end add-op-button" size="sm">
                    <BDropdownItem
                        v-for="op in operationTypes"
                        :key="op"
                        @click="addOperation(op)"
                    >
                        {{ op }}
                    </BDropdownItem>
                </BDropdown>
                <h6 class="mb-0">Data Source</h6>
            </template>

            <BFormSelect v-model="selectedDataset" :options="availableDataSources">
                <template #first>
                    <BFormSelectOption :value="null" disabled>
                        -- Please select a dataset --
                    </BFormSelectOption>
                </template>
            </BFormSelect>
        </BCard>

        <DataView :Dataset="intermediateResults[0]" :Collapsed="true" />

        <template v-for="(op, idx) in operations" :key="idx">
            <BCard no-body>
                <template #header>
                    <BButton
                        @click="removeOperation(idx)"
                        title="Remove this operation"
                        class="btn-close ms-auto float-end"
                        aria-label="Close"
                        v-b-tooltip.hover
                    />
                    <BButton
                        @click="toggleOperationVisibility(idx)"
                        :title="operationVisibilities[idx] ? 'Collapse' : 'Expand'"
                        variant="link"
                        class="text-dark collapse-button text-decoration-none"
                    >
                        <IBiChevronUp v-if="operationVisibilities[idx]"  title="Collapse" />
                        <IBiChevronDown v-else title="Expand" />
                    </BButton>
                    <h6 class="mb-0" :title="helpStrings[op.type]" v-b-tooltip.hover>
                        {{ capitalizeFirst(op.type) }}
                    </h6>
                </template>

                <BCollapse :visible="operationVisibilities[idx]">
                    <div class="operation-wrapper">
                        <component
                            v-if="cardHasBody(op.type)"
                            :is="operationToComponent(op.type)"
                            v-model="operations[idx]"
                            :previousResult="intermediateResults[idx]"
                            :owner="id"
                            :specialTokens="specialTokens"
                        />
                        <div v-else class="no-operation-settings">No settings for this operation</div>
                    </div>
                </BCollapse>
            </BCard>

            <DataView :Dataset="intermediateResults[idx + 1]" :Collapsed="true" />
        </template>

        <DatasetPublisher :Owner="id" :Source="datasource" :Dataset="finalDataset" />
    </div>
</template>

<script lang="ts">
import { ref, computed, watch, defineComponent } from 'vue';
import { cloneDeep as clone } from 'lodash-es';
import { useWindowMixin } from '@render/components/Core/Window/WindowMixin';
import RegisterDataComponent from '@render/components/Core';
import { RenderMode } from '@store/datawindow.types';
import { useDatasetsStore } from '@store/datasets.store';


import {
    MapOperation,
    SortOperation,
    DataView,
    PluckOperation,
    FilterOperation,
    AggregateOperation,
    DatasetPublisher,
} from './Operations';
import { DataQuerySettings } from './DataQuery.types';
import DataService, { Operation } from '@render/api';

RegisterDataComponent({
    friendly_name: 'Data Query',
    component_type: 'DataQuery',
    settings_type: undefined,
    init_width: 400,
    init_height: 500,
    available_render_modes: [RenderMode.HTML],
    default_render_mode: RenderMode.HTML,
    default_settings: {
        dataset: null,
        operations: [],
    },
});

export default defineComponent({
    name: 'DataQuery',
    components: {
        MapOperation,
        SortOperation,
        DataView,
        PluckOperation,
        FilterOperation,
        AggregateOperation,
        DatasetPublisher,
    },
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        //const store = useStore();
        const { layout, dataview, settings, $wstate, datasource } = useWindowMixin<DataQuerySettings>(props.id);

        const datasetsStore = useDatasetsStore()

        const selectedDataset = ref(settings.value?.dataset || null);
        const operations = ref(clone(settings.value?.operations || []));
        const intermediateResults = ref<any[]>([]);
        const operationVisibilities = ref<boolean[]>([]);
        const operationTypes = ['map', 'filter', 'aggregate', 'sort', 'pluck', 'keys', 'values'];

        operationVisibilities.value = operations.value.map(op => cardHasBody(op.type));

        const helpStrings = {
            map: 'Returns an array of objects containing only the specified columns',
            filter: 'Returns a filtered array containing only objects passing the filter criteria',
            aggregate: 'Returns an array of objects containing the aggregate values after grouping',
            sort: 'Returns an array of objects sorted by a column',
            pluck: 'Returns an array of values from the specified column',
            keys: 'Returns an array of keys for an object',
            values: 'Returns an array of the values for an object',
        };

        const availableDataSources = computed(() =>
            getDataSourceItems(datasetsStore.manifest)
        );

        const finalDataset = computed(() => intermediateResults.value.at(-1));

        const specialTokens = computed(() => ({
            $SelectedSyllable: dataview.value.selectedSyllable,
            $AvailableSyllables: dataview.value.selectedSyllables,
            $SelectedGroups: dataview.value.selectedGroups,
        }));

        function getDataSourceItems(manifest, prefix = '/') {
            const ignoreKeys = ['syllable_clips'];
            return Object.entries(manifest).flatMap(([k, v]) => {
                if (ignoreKeys.includes(k)) return [];
                if (typeof v === 'object') return getDataSourceItems(v, `${prefix}${k}/`);
                return [{ text: `${prefix}${k}`, value: v }];
            });
        }

        function capitalizeFirst(str: string) {
                return str.charAt(0).toUpperCase() + str.slice(1);
        }

        function cardHasBody(opType: string) {
            return !['keys', 'values'].includes(opType);
        }

        function operationToComponent(opType: string) {
            return `${capitalizeFirst(opType)}Operation`;
        }

        function addOperation(opType: string) {
            const op = operationFactory(opType);
            if (op) {
                operations.value.push(op);
                operationVisibilities.value.push(cardHasBody(opType));
            }
        }

        function removeOperation(idx: number) {
            operations.value.splice(idx, 1);
            operationVisibilities.value.splice(idx, 1);
            intermediateResults.value.splice(idx, 1);
        }

        function toggleOperationVisibility(idx: number) {
            operationVisibilities.value[idx] = !operationVisibilities.value[idx];
        }

        function operationFactory(type: string) {
            const map = {
                map: { type: 'map', columns: undefined },
                pluck: { type: 'pluck', column: '' },
                keys: { type: 'keys' },
                values: { type: 'values' },
                sort: { type: 'sort', columns: [] },
                filter: { type: 'filter', filters: {} },
                aggregate: { type: 'aggregate', groupby: [], aggregate: {} },
            };
            return map[type];
        }

        function inferDataTypeForColumn(obj: any[], col: string) {
            if (obj.length === 0) return 'undefined';
            const value = obj[0][col];
            if (typeof value === 'number') return Number.isInteger(value) ? 'int' : 'float';
            return typeof value;
        }

        function convertFiltersToTypedFilters(obj: any[], filters: Record<string, string[]>) {
            return Object.fromEntries(
                Object.entries(filters).map(([col, vals]) => {
                    const colType = inferDataTypeForColumn(obj, col);
                    const substituted = vals.flatMap(v =>
                        Object.keys(specialTokens.value).includes(v) ? specialTokens.value[v] : v
                    );

                    let typedVals;
                    if (colType === 'int') typedVals = substituted.map(v => parseInt(v, 10));
                    else if (colType === 'float') typedVals = substituted.map(v => parseFloat(v));
                    else if (colType === 'boolean') typedVals = substituted.map(Boolean);
                    else typedVals = substituted;

                    return [col, typedVals];
                })
            );
        }

        function prepareOperations(ops: Operation[]): Operation[] {
            return ops.map((op, idx) => {
                if (op.type === 'filter') {
                    const cln = clone(op);
                    cln.filters = convertFiltersToTypedFilters(intermediateResults.value[idx], cln.filters);
                    return cln;
                }
                return clone(op);
            });
        }

        async function prepareData() {
            if (!selectedDataset.value)
                return;

            for (let i = 0; i < operations.value.length + 1; i++) {
                const ops = prepareOperations(operations.value.slice(0, i));
                DataService.fetchData(selectedDataset.value, ops)
                    .catch(err => {
                        console.error('Error fetching data:', err);
                        intermediateResults.value[i] = [];
                    })
                    .then(data => {
                        intermediateResults.value[i] = data;
                    });
            }
        }

        watch(selectedDataset, val => {
            if (val !== null) {
                $wstate.updateComponentSettings({
                    settings: { dataset: val },
                });
            }
        });

        watch(operations, val => {
            $wstate.updateComponentSettings({
                settings: { operations: clone(val) },
            });
        }, { deep: true });

        watch(selectedDataset, prepareData, { immediate: true });
        watch(operations, prepareData, { deep: true });
        watch(specialTokens, prepareData);

        return {
            selectedDataset,
            availableDataSources,
            operations,
            addOperation,
            removeOperation,
            toggleOperationVisibility,
            operationVisibilities,
            intermediateResults,
            operationTypes,
            helpStrings,
            specialTokens,
            finalDataset,
            capitalizeFirst,
            cardHasBody,
            operationToComponent,
            layout,
            datasource,
        };
    },
});
</script>

<style scoped>
.card {
    margin: 0.75rem 1.0rem;
}
.add-op-button {
    margin-top: -0.125rem;
    margin-bottom: -0.125rem;
}
.collapse-button {
    padding: 0;
    margin-right: 1rem;
}
.collapsed > .when-opened,
:not(.collapsed) > .when-closed {
    display: none;
}
.operation-wrapper {
    padding: 0.5rem;
}
.no-operation-settings {
    text-align: center;
    color: #555;
    font-style: italic;
}
.wrapper :deep(h6) {
    display: inline-block;
    line-height: 26px;
}
.wrapper :deep(.card-header) {
    padding: 0.5rem 1.25rem;
}
.wrapper {
    overflow: auto;
}
</style>
