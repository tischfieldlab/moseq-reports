<template>
    <BCard class="shadow datafilter">
        <template v-slot:header>
            <div :style="headerStyles" class="d-flex align-items-center px-2">
                <!-- Collapse Button -->
                <button
                    @click="toggleCollapse"
                    :title="is_expanded ? 'Collapse Filters' : 'Expand Filters'"
                    class="btn btn-link text-decoration-none collapse-button me-2"
                    :style="{ color: headerStyles.color }"
                >
                    <i
                        v-if="is_expanded"
                        class="bi-chevron-up when-opened"
                        :style="{ color: headerStyles.color }"
                    ></i>
                    <i
                        v-else
                        class="bi-chevron-down when-closed"
                        :style="{ color: headerStyles.color }"
                    ></i>
                </button>

                <!-- Editable Text -->
                <EditableText
                    class="editable-text flex-grow-1"
                    v-model="filter_name"
                    size="sm"
                    :style="{ color: headerStyles.color }"
                />

                <!-- Color Picker Button -->
                <button
                    :id="generateId(datasource)"
                    title="Click to select color"
                    class="btn btn-link text-decoration-none color-button"
                >
                    <i class="bi-droplet-half" :style="{ color: headerStyles.color }"></i>
                </button>
                <BPopover :target="generateId(datasource)" :click="true" placement="top">
                    <template v-slot:title>Dataview `{{ filter_name }}` Color </template>
                    <chrome-picker 
                        v-model="color"
                        :disableAlpha="true" 
                        @update:modelValue="(value) => colorChangeHandler(element, value.hex)"
                    />
                </BPopover>

                <!-- Close Button -->
                <BButton
                    type="button"
                    @click="confirmRemoveFilter"
                    title="Remove this filter"
                    class="btn-close ms-auto"
                    aria-label="Close"
                    :disabled="isDefaultFilter"
                    :style="{ color: headerStyles.color }"
                ></BButton>
            </div>
        </template>


        <BCollapse v-model="is_expanded" :id="generateId('filter-collapse')">
            <BOverlay :show="is_loading" no-fade>
                <div class="container">
                    <GroupBox :datasource="datasource" />
                    <BInputGroup prepend="Count Method" class="filter-item count-method mb-3">
                        <BFormSelect v-model="selectedCountMethod" :options="countMethods" />
                    </BInputGroup>

                    <BInputGroup prepend="Selected Syllable" class="filter-item selected-syllable mb-3">
                        <button
                            class="prev btn btn-outline-info btn-sm"
                            @click="previousSyllable"
                            :disabled="!canPreviousSyllable"
                        >
                            <i class="bi-caret-left-fill"></i>
                        </button>
                        <BFormSelect
                            class="syllable-number"
                            v-model="syllable"
                            :options="syllableIdOptions"
                        />
                        <button
                            class="next btn btn-outline-info btn-sm"
                            @click="nextSyllable"
                            :disabled="!canNextSyllable"
                        >
                            <i class="bi-caret-right-fill"></i>
                        </button>
                    </BInputGroup>

                    <syllable-id-filter :datasource="datasource" />
                </div>
            </BOverlay>
        </BCollapse>

        <BModal ref="confirmModal" title="Confirmation" ok-title="Yes" cancel-title="No" @ok="removeFilter">
            Are you sure you want to remove this data filter?
        </BModal>
    </BCard>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { CountMethod, DataviewState } from "@store/dataview.types";
import GroupBox from '@render/components/GroupBox.vue';
import SyllableIdFilter from "@render/components/SyllableIdFilter.vue";
import EditableText from "@render/components/EditableText.vue";
import { Chrome } from "@ckpack/vue-color";
import { getContrastingColor } from "@render/components/Charts/Colors/D3ColorProvider";
import { BModal } from "bootstrap-vue-next";

import { useFiltersStore } from "@store/filters.store";
import { useDataViewStore } from "@store/dataview.store";
import { debounce } from "@render/util/Events";

export default defineComponent({
    components: {
        GroupBox,
        EditableText,
        ChromePicker: Chrome,
        SyllableIdFilter
    },
    props: {
        datasource: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const filtersStore = useFiltersStore();
        const dataviewStore = useDataViewStore(props.datasource);

        const is_expanded = ref<boolean>(true);
        const countMethods = ref([
            { text: "Usage", value: CountMethod.Usage },
            { text: "Frames", value: CountMethod.Frames },
        ]);
        const confirmModal = ref<InstanceType<typeof BModal> | null>(null);

        const filter_name = computed({
            get(): string {
                return dataviewStore.name;
            },
            set(value: string) {
                dataviewStore.name = value;
            },
        })
        const color = computed({
            get(): string {
                return dataviewStore.color || "#000000" ;
            },
            set(value: { hex: string }) {
                dataviewStore.color = value.hex;
            },
        });
        const colorChangeHandler = debounce((newColor) => {
            dataviewStore.color = newColor.hex;
        }, 100);
        const headerStyles = computed(() => {
            return {
                background: color.value,
                color: getContrastingColor(color.value) === "dark" ? "black" : "white",
            };
        });
        const is_loading = computed((): boolean => {
            return dataviewStore.loading || false;
        });
        const selectedCountMethod = computed({
            get(): CountMethod {
                return dataviewStore.countMethod;
            },
            set(value: CountMethod) {
                dataviewStore.switchCountMethod(value);
            },
        });
        const syllable = computed({
            get(): number {
                return dataviewStore.selectedSyllable;
            },
            set(value: number) {
                dataviewStore.selectedSyllable = value;
            },
        });
        const syllableIdOptions = computed((): { value: number; text: string }[] => {
            const filterIds = dataviewStore.moduleIdFilter;
            const availableIds = dataviewStore.availableModuleIds;

            const filteredIds = filterIds.length > 0
                ? availableIds.filter((id) => filterIds.includes(id))
                : availableIds;

            console.log("Filtered IDs:", filteredIds);

            return filteredIds.map((id) => ({
                value: id,
                text: id.toString(),
            }));
        });
        
        const canPreviousSyllable = computed((): boolean => {
            return syllable.value > Math.min(...syllableIdOptions.value.map((opt) => opt.value));
        });
        const canNextSyllable = computed((): boolean  =>{
            return syllable.value < Math.max(...syllableIdOptions.value.map((opt) => opt.value));
        });
        const isDefaultFilter = computed((): boolean => {
            return filtersStore.items.length === 1;
        });



        function generateId(suffix: string): string {
            return `${props.datasource}-${suffix}`;
        }
        function toggleCollapse() {
            is_expanded.value = !is_expanded.value;
        }
        function getContrast(hexcolor: string): string {
            const c = getContrastingColor(hexcolor);
            if (c === "dark") {
                return "black";
            } else {
                return "white";
            }
        }
        function confirmRemoveFilter() {
            if (!isDefaultFilter.value && confirmModal.value) {
                confirmModal.value.show();
            }
        }
        function removeFilter() {
            filtersStore.removeFilter(props.datasource);
        }
        function previousSyllable() {
            if (canPreviousSyllable.value) {
                syllable.value--;
            }
        }
        function nextSyllable() {
            if (canNextSyllable.value) {
                syllable.value++;
            }
        }
        function updateSelectedSyllable(syllableId: number) {
            dataviewStore.selectedSyllable = syllableId;
        }

        return {
            is_expanded,
            countMethods,
            confirmModal,
            filter_name,
            color,
            headerStyles,
            is_loading,
            selectedCountMethod,
            syllable,
            syllableIdOptions,
            canPreviousSyllable,
            canNextSyllable,
            isDefaultFilter,
            generateId,
            toggleCollapse,
            getContrast,
            confirmRemoveFilter,
            removeFilter,
            previousSyllable,
            nextSyllable,
            updateSelectedSyllable,
        };
    },
    mounted() {
        this.confirmModal = this.$refs.confirmModal as InstanceType<typeof BModal>;
    },
});
</script>

<style scoped>
.collapse-button {
    padding: 0;
}
.datafilter {
    margin-left: 7px;
    margin-bottom: 4px;
}
.container {
    padding: 0;
}
.filter-item {
    margin-bottom: 0.5rem;
}
.filter-module-id {
    padding: 0.5rem;
    background-color: #f8f9fa;
    border-radius: 4px;
}
.filter-module-id label {
    display: block;
    margin-bottom: 0.25rem;
}
.filter-module-id .BFormTags {
    margin: 0;
}
.card-body {
    padding: 0;
}
.datafilter > .card-header {
    padding: 0;
}
.btn-close {
    margin-left: auto;
}
</style>
