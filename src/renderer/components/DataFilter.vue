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
      <chrome-picker v-model="color" :disableAlpha="true" />
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

            <div class="filter-module-id mb-2">
              <label for="filter-module-id" class="d-flex justify-content-between align-items-center">
                <span>Filter Module ID</span>
                <button
                  v-if="tags.length > 0"
                  class="btn btn-link p-0 text"
                  @click="clearAllTags"
                  title="Clear all IDs"
                >
                  <i class="bi-x-circle-fill"></i>
                </button>
              </label>
              <BFormTags
                id="filter-module-id"
                v-model="tags"
                class="mb-2"
                separator=" ,;"
                placeholder="Add ID(s)..."
                :tag-validator="tagValidator"
              ></BFormTags>
            </div>
          </div>
        </BOverlay>
      </BCollapse>

      <BModal ref="confirmModal" title="Confirmation" ok-title="Yes" cancel-title="No" @ok="removeFilter">
        Are you sure you want to remove this data filter?
      </BModal>
    </BCard>
  </template>

  <script lang="ts">
  import { defineComponent } from "vue";
  import { CountMethod, DataviewState } from "@render/store/dataview.types";
  import GroupBox from '@render/components/GroupBox.vue';
  import EditableText from "@render/components/EditableText.vue";
  import { Chrome } from "@ckpack/vue-color";
  import parsePart from "parse-numeric-range";
  import { unnest } from "@render/util/Vuex";
  import { getContrastingColor } from "@render/components/Charts/Colors/D3ColorProvider";
  import { BModal } from "bootstrap-vue-next";
  export default defineComponent({
    components: {
      GroupBox,
      EditableText,
      ChromePicker: Chrome,
    },
    props: {
      datasource: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        is_expanded: true,
        tags: [],
        countMethods: [
          { text: "Usage", value: CountMethod.Usage },
          { text: "Frames", value: CountMethod.Frames },
        ],confirmModal: null as InstanceType<typeof BModal> | null,
      };
    },
    computed: {
      filter_name: {
        get(): string {
          return this.dataview?.name || "";
        },
        set(value: string) {
          this.$store.commit(`${this.datasource}/setName`, value);
        },
      },
      color: {
        get(): string {
          return this.dataview?.color || "#000000" ;
        },
        set(value: { hex: string }) {
          this.$store.commit(`${this.datasource}/setColor`, value.hex);
        },
      },
      headerStyles() {
        const bgColor = this.color;
    return {
      background: bgColor,
      color: getContrastingColor(bgColor) === "dark" ? "black" : "white",
    };
  },

      dataview(): DataviewState {
        return unnest(this.$store.state, this.datasource);
      },
      is_loading(): boolean {
        return this.dataview?.loading || false;
      },
      selectedCountMethod: {
        get(): CountMethod {
          return this.dataview?.countMethod || CountMethod.Usage;
        },
        set(value: CountMethod) {
          this.$store.dispatch(`${this.datasource}/switchCountMethod`, value);
        },
      },
      syllable: {
        get(): number {
          return this.dataview?.selectedSyllable || 0;
        },
        set(value: number) {
          this.$store.commit(`${this.datasource}/setSelectedSyllable`, value);
        },
      },
      syllableIdOptions(): { value: number; text: string }[] {
        const filterIds = this.tagsAsIds;
        const availableIds =
          this.$store.getters[`${this.datasource}/availableModuleIds`] || [];

        const filteredIds = filterIds.length > 0
          ? availableIds.filter((id) => filterIds.includes(id))
          : availableIds;

        return filteredIds.map((id) => ({
          value: id,
          text: id.toString(),
        }));
      },
      tagsAsIds(): number[] {
        try {
          return parsePart(this.tags.join(",")) || [];
        } catch {
          return [];
        }
      },
      canPreviousSyllable(): boolean {
        return this.syllable > Math.min(...this.syllableIdOptions.map((opt) => opt.value));
      },
      canNextSyllable(): boolean {
        return this.syllable < Math.max(...this.syllableIdOptions.map((opt) => opt.value));
      },
      isDefaultFilter(): boolean {
        return this.$store.state.filters?.items?.length === 1;
      },
    },
    watch: {
      tagsAsIds: {
        handler(newIds: number[], oldIds: number[]) {
          if (newIds.length > 0 && JSON.stringify(newIds) !== JSON.stringify(oldIds)) {
            const newSelected = Math.min(...newIds); 
            this.updateSelectedSyllable(newSelected);
          }
        },
        deep: true,
      },
    },

    methods: {
      generateId(suffix: string): string {
        return `${this.datasource}-${suffix}`;
      },
      toggleCollapse() {
        this.is_expanded = !this.is_expanded;
      },
      getContrast(hexcolor: string): string {
      const c = getContrastingColor(hexcolor);
      if (c === "dark") {
        return "black";
      } else {
        return "white";
      }
    },
      confirmRemoveFilter() {
        if (!this.isDefaultFilter && this.confirmModal) {
          this.confirmModal.show();
        }
      },
      removeFilter() {
        this.$store.dispatch("filters/removeFilter", this.datasource);
      },
      previousSyllable() {
        if (this.canPreviousSyllable) {
          this.syllable--;
        }
      },
      nextSyllable() {
        if (this.canNextSyllable) {
          this.syllable++;
        }
      },
      clearAllTags() {
        this.tags = [];
      },
      tagValidator(tag: string) { 
        const ids = parsePart(tag) as number[];
        const availableIds =
        this.$store.getters[`${this.datasource}/availableModuleIds`] || [];
        if (!ids || ids.length === 0) {
          return false;
        }
         
          return ids.every((id) =>
          availableIds.includes(id));
      },
      updateSelectedSyllable(syllableId: number) {
      this.$store.commit(`${this.datasource}/setSelectedSyllable`, syllableId);
    },
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
  .btn-close {
    margin-left: auto;
  }
  </style>
