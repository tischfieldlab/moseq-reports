<template>
  <b-card class="shadow datafilter">
    <template v-slot:header>
      <div :style="{ background: color.hex }" class="d-flex align-items-center px-2">
        <button
          @click="toggleCollapse"
          :title="is_expanded ? 'Collapse Filters' : 'Expand Filters'"
          class="btn btn-link text-dark text-decoration-none collapse-button me-2"
        >
          <i v-if="is_expanded" class="bi-chevron-up when-opened" title="Collapse Filters"></i>
          <i v-else class="bi-chevron-down when-closed" title="Expand Filters"></i>
        </button>
        <EditableText class="editable-text flex-grow-1" v-model="filter_name" size="sm" />
        <button
          :id="generateId(datasource)"
          title="Click to select color"
          class="btn btn-link text-dark text-decoration-none color-button"
        >
          <i class="bi-droplet-half" style="width: 16px; margin-left: 14px"></i>
        </button>
        <b-popover :target="generateId(datasource)" triggers="click blur" placement="top">
          <template v-slot:title>Dataview `{{ filter_name }}` Color</template>
          <chrome-picker v-model="color" :disableAlpha="true" />
        </b-popover>
        <button
          type="button"
          @click="confirmRemoveFilter"
          title="Remove this filter"
          class="btn-close ms-auto"
          aria-label="Close"
          :disabled="isDefaultFilter"
        ></button>
      </div>
    </template>

    <b-collapse v-model="is_expanded" :id="generateId('filter-collapse')">
      <b-overlay :show="is_loading" no-fade>
        <div class="container">
          <b-input-group prepend="Count Method" class="filter-item count-method mb-3">
            <b-form-select v-model="selectedCountMethod" :options="countMethods" />
          </b-input-group>

          <b-input-group prepend="Selected Syllable" class="filter-item selected-syllable mb-3">
            <button
              class="prev btn btn-outline-info btn-sm"
              @click="previousSyllable"
              :disabled="!canPreviousSyllable"
            >
              <i class="bi-caret-left-fill"></i>
            </button>
            <b-form-select
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
          </b-input-group>

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
            <b-form-tags
              id="filter-module-id"
              v-model="tags"
              class="mb-2"
              separator=" ,;"
              placeholder="Add ID(s)..."
            ></b-form-tags>
          </div>
        </div>
      </b-overlay>
    </b-collapse>

    <b-modal ref="confirmModal" title="Confirmation" ok-title="Yes" cancel-title="No" @ok="removeFilter">
      Are you sure you want to remove this data filter?
    </b-modal>
  </b-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { CountMethod, DataviewState } from "@render/store/dataview.types";
import EditableText from "@render/components/EditableText.vue";
import { ChromePicker } from "vue-color";
import parsePart from "parse-numeric-range";
import { unnest } from "@render/util/Vuex";

export default defineComponent({
  components: {
    EditableText,
    "chrome-picker": ChromePicker,
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
      ],
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
      get(): { hex: string } {
        return { hex: this.dataview?.color || "#000000" };
      },
      set(value: { hex: string }) {
        this.$store.commit(`${this.datasource}/setColor`, value.hex);
      },
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
  methods: {
    generateId(suffix: string): string {
      return `${this.datasource}-${suffix}`;
    },
    toggleCollapse() {
      this.is_expanded = !this.is_expanded;
    },
    confirmRemoveFilter() {
      if (!this.isDefaultFilter) {
        this.$refs.confirmModal?.show?.();
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
.filter-module-id .b-form-tags {
  margin: 0;
}
.card-body {
  padding: 0;
}
.btn-close {
  margin-left: auto;
}
</style>
