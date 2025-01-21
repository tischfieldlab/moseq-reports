<template>
  <b-card no-body class="group_selection filter-item">
    <div class="input-group-text">Group Selection</div>
    <b-list-group flush>
    
        <b-list-group-item v-for="option in groups" :key="option.name">
          <div :class="{ 'group-wrap': true, [option.style]: true }">
            <b-form-checkbox switch @input="updateGroups" v-model="option.selected" :name="option.name">
            </b-form-checkbox>
            <div
              class="swatch"
              :id="generateId(option.id)"
              :style="{ 'background-color': option.color }"
              title="Click to select color"
            >
              <span class="group-count" :style="{ color: getContrast(option.color) }">{{
                group_counts[option.name]
              }}</span>
            </div>
            <b-popover :target="generateId(option.id)" triggers="click blur" placement="top">
              <template #title>Group Color ({{ option.name }})</template>
              <chrome-picker
                :modelValue="option.color"
                @update:modelValue="(value) => colorChangeHandler(option, value)"
                :disableAlpha="true"
              />
            </b-popover>
            <span class="group_name" :title="option.name">{{ option.name }}</span>
          </div>
        </b-list-group-item>
    
    </b-list-group>
  </b-card>
</template>
<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from "vue";
import draggable from "vuedraggable";
import { Chrome } from "@ckpack/vue-color";
import { debounce } from "@render/util/Events";
import deepEqual from "deep-equal";
import { getContrastingColor } from "@render/components/Charts/Colors/D3ColorProvider";
import axios from "axios";
import { useStore } from "vuex";

class SelectableGroupItem {
  public name: string;
  public selected: boolean;
  public color: string;
  public count: number = 0;

  get style(): string {
    return this.selected ? "selected" : "non-selected";
  }
  get id(): string {
    return "group_" + this.name.replace(/\W/g, "_");
  }

  constructor(name: string, selected: boolean = true) {
    this.name = name;
    this.selected = selected;
    this.color = "#000000";
  }
}

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
    const store = useStore(); // Access Vuex store
    const groups = ref<SelectableGroupItem[]>([]);
    const group_counts = ref<Record<string, number>>({});
    const serverAddress = computed(() => store.getters["server/getServerAddress"]);
    const watchers: (() => void)[] = [];

    const dataview = computed(() => store.state[props.datasource]);

    const generateId = (suffix: string): string => {
      return `${props.datasource}-${suffix}`;
    };

    const buildGroups = async () => {
      const availableGroups =
        store.getters[`${props.datasource}/availableGroups`] || [];
      const selectedGroups = dataview.value?.selectedGroups || [];
      const colorScale = dataview.value?.groupColors || [];

      groups.value = availableGroups.map((g: string, i: number) => {
        const groupItem = new SelectableGroupItem(g, selectedGroups.includes(g));
        groupItem.color = colorScale[i] || "#000000";
        return groupItem;
      });
    };

    const updateGroups = () => {
      const selectedGroups = groups.value
        .filter((g) => g.selected)
        .map((g) => g.name);
      const selectedColors = groups.value
        .filter((g) => g.selected)
        .map((g) => g.color);

      if (!deepEqual(selectedGroups, dataview.value?.selectedGroups)) {
        store.dispatch(`${props.datasource}/updateSelectedGroups`, {
          groups: selectedGroups,
          colors: selectedColors,
        });
      }
    };

    const updateColors = () => {
      const selectedColors = groups.value
        .filter((g) => g.selected)
        .map((g) => g.color);

      if (!deepEqual(selectedColors, dataview.value?.groupColors)) {
        store.dispatch(`${props.datasource}/updateSelectedGroups`, {
          colors: selectedColors,
        });
      }
    };

    const updateGroupCounts = async () => {
      try {
        const response = await axios.get(`${serverAddress.value}/fetch-data`, {
          params: {
            path: store.getters[`datasets/resolve`]("samples"),
            operations: JSON.stringify([{ type: "map" }]),
            debug: false,
          },
        });
        const resolvedData = response.data;
        console.log(resolvedData)
        if (Array.isArray(resolvedData)) {
          group_counts.value = resolvedData.reduce((acc, curr) => {
            if (curr.default_group !== undefined) {
              acc[curr.default_group] = (acc[curr.default_group] || 0) + 1;
            }
            return acc;
          }, {});
        } else {
          console.error("Resolved data is not an array:", resolvedData);
        }
      } catch (err) {
        console.error("Error updating group counts:", err);
      }
    };

    const getContrast = (hexcolor: string): string => {
      const contrast = getContrastingColor(hexcolor);
      return contrast === "dark" ? "black" : "white";
    };

    onMounted(() => {
      const colorChangeHandler = debounce((option, event) => {
        option.color = event.hex;
        updateColors();
      }, 100);

      watchers.push(
        store.watch(
          (state, getters) => getters[`${props.datasource}/availableGroups`],
          () => {
            updateGroupCounts();
            buildGroups();
          },
          { immediate: true }
        )
      );

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
                }
              });
            }
          },
          { deep: true }
        )
      );
    });

    onUnmounted(() => {
      watchers.forEach((unwatch) => unwatch());
    });

    return {
      groups,
      group_counts,
      buildGroups,
      updateGroups,
      updateColors,
      updateGroupCounts,
      getContrast,
      generateId,
    };
  },
});
</script>


<style scoped>
.list-group {
  margin: -1px;
}
.list-group-item {
  padding: 0.5em 0.25em;
}
.group-wrap {
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
  float: left;
}
.swatch {
  width: 24px;
  height: 24px;
  float: left;
  border: 1px solid #efefef;
  margin: 0 10px 0 5px;
  border-radius: 24px;
  cursor: pointer;
  text-align: center;
  font-size: 10px;
  line-height: 21px;
  font-weight: bold;
}
.group_name {
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 175px;
  font-size: 13px;
  padding: 2.5px 0px;
}
</style>
