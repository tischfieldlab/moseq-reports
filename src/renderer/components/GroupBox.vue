<template>
    <BCard no-body class="group_selection filter-item">
        <div class="input-group-text">Group Selection</div>
        <BListGroup flush>
            <draggable :list="groups" item-key="name">
                <template #item="{ element }">
                    <BListGroupItem :key="element.name" class="group-item" :class="element.style">
                        <div :class="{ 'group-wrap': true, [element.style]: true }">
                            <BFormCheckbox switch v-model="element.selected" :name="element.name" />
                            <div
                                class="swatch"
                                :id="generateId(element.name)"
                                :style="{ 'background-color': element.color }"
                                title="Click to select color"
                            >
                                <span class="group-count" :style="{ color: getContrast(element.color) }">{{ group_counts[element.name] }}</span>
                            </div>
                            <BPopover :target="generateId(element.name)" triggers="click blur" placement="end" :click="true" offset="35">
                                <template #title>Group Color ({{ element.name }})</template>
                                <chrome-picker
                                    v-model="element.color"
                                    @update:modelValue="(value) => colorChangeHandler(element, value.hex)"
                                    :disableAlpha="true"
                                />
                            </BPopover>
                            <span class="group_name" :title="element.name">{{ element.name }}</span>
                        </div>
                    </BListGroupItem>
                </template>
            </draggable>
        </BListGroup>
    </BCard>
</template>
<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from "vue";
import draggable from "vuedraggable";
import { Chrome } from "@ckpack/vue-color";
import { getContrastingColor } from "@render/components/Charts/Colors/D3ColorProvider";

import { useDataViewStore } from "@store/dataview.store";
import {useDatasetsStore} from "@store/datasets.store";
import { debounce } from "@render/util/Events";
import DataService from "@api";


export default defineComponent({
    name: "GroupBox",
    components: {
        draggable,
        ChromePicker: Chrome,
    },
    props: {
        datasource: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const datasetsStore = useDatasetsStore();
        const dataviewStore = useDataViewStore(props.datasource);

        const watchers: (() => void)[] = [];

        const group_counts = ref<Record<string, number>>({});
        const updateGroupCounts = async () => {
            DataService.fetchData("samples", [{ type: "map" }])
                .catch((err) => {
                    console.error("Error fetching samples:", err);
                })
                .then((data) => {
                    if (Array.isArray(data)) {
                        group_counts.value = data.reduce((acc, curr) => {
                            if (curr.default_group !== undefined) {
                                acc[curr.default_group] = (acc[curr.default_group] || 0) + 1;
                            }
                            return acc;
                        }, {});
                    } else {
                        console.error("Resolved data is not an array:", data);
                    }
                });
        };
        updateGroupCounts();

        const getContrast = (hexcolor: string): string => {
            const contrast = getContrastingColor(hexcolor);
            return contrast === "dark" ? "black" : "white";
        };

        const colorChangeHandler = debounce((option, event) => {
            option.color = event;
        }, 100);

        onMounted(() => {
        

            /*watchers.push(
                store.watch(
                (state, getters) => getters[`${props.datasource}/availableGroups`],
                () => {
                    updateGroupCounts();
                    buildGroups();
                },
                { immediate: true }
                )
            );*/
            /*
            watchers.push(
                store.watch(
                    (state) => {
                        const dv = state[props.datasource];
                        return {
                            c: dv?.groupColors || [],
                            s: dv?.selectedGroups || [],
                        };
                    },
                    (newValue) => {
                        if (newValue.s && newValue.c) {
                            groups.value.forEach((g) => {
                                const isSelected = newValue.s.includes(g.name);
                                g.selected = isSelected;
                                if (isSelected) {
                                    g.color = newValue.c[newValue.s.indexOf(g.name)];
                                    console.log("g color",g.color)
                                }
                            });
                        }
                    },
                    { deep: true }
                )
            );*/
        });

        onUnmounted(() => {
            watchers.forEach((unwatch) => unwatch());
        });

        return {
            groups: dataviewStore.groups,
            group_counts,
            //buildGroups,
            //updateGroups,
            //updateColors,
            updateGroupCounts,
            getContrast,
            colorChangeHandler,
        };
    },
    methods:{
        generateId(suffix: string): string {
            return `${this.datasource}-${suffix}`;
        },
    },
});
</script>


<style scoped>
.list-group-item {
    padding: 0.5em 0.25em;
}
.group-wrap {
    display: flex;
    height: 24px;
}
.group-wrap::after {
    content: "\22EE";
    float: right;
    margin-right: 5px;
    cursor: grab;
}
.group-wrap.non-selected {
    color: #aaaaaa;
}
.group_selection .input-group-text {
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
    margin: -1px;
}
.custom-switch {
    float: right;
}
.swatch {
    width: 24px;
    height: 24px;
    float: left;
    border: 1px solid #efefef;
    margin: 0 7px 0 2px;
    border-radius: 24px;
    cursor: pointer;
    text-align: center;
    font-size: 10px;
    line-height: 21px;
    font-weight: bold;
}
.group_name {
    flex-grow: 1;
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 175px;
    font-size: 13px;
    padding: 2.5px 0px;
}
</style>
