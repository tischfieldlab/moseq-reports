<template>
  <b-card class="shadow datafilter">
    <template v-slot:header>
      <div :style="{ background: color, color: getContrast(color) }">
        <b-button
          @click="is_expanded = !is_expanded"
          :title="is_expanded ? 'Collapse Filters' : 'Expand Filters'"
          v-b-toggle="$id('filter-collapse')"
          variant="link"
          class="text-dark collapse-button text-decoration-none"
        >
          <b-icon class="when-opened" title="Collapse Filters" icon="chevron-up"></b-icon>
          <b-icon class="when-closed" title="Expand Filters" icon="chevron-down"></b-icon>
        </b-button>
        <b-button-close @click="removeThis" title="Remove this filter" />
        <EditableText class="editable-text" v-model="filter_name" size="sm" />
        <b-button
          variant="link"
          :id="$id(datasource)"
          title="Click to select color"
          class="text-dark text-decoration-none color-button"
        >
          <b-icon icon="droplet-half" style="width: 16px; margin-left: 6px"></b-icon>
        </b-button>
        <b-popover :target="$id(datasource)" triggers="click blur" placement="top">
          <template v-slot:title>Dataview `{{ filter_name }}` Color</template>
          <chrome-picker v-model="color" :disableAlpha="true" />
        </b-popover>
      </div>
    </template>
    <b-collapse :visible="is_expanded" :id="$id('filter-collapse')">
      <b-overlay :show="is_loading" no-fade>
        <div class="container">
          <GroupBox :datasource="datasource" />

          <b-input-group prepend="Count Method" class="filter-item count-method">
            <b-form-select v-model="selectedCountMethod" :options="countMethods" />
          </b-input-group>

          <b-input-group prepend="Selected Syllable" class="filter-item selected-syllable">
            <b-button
              class="prev"
              size="sm"
              variant="outline-info"
              @click="previousSyllable"
              :disabled="!canPreviousSyllable"
            >
              <b-icon icon="caret-left-fill" aria-hidden="true" />
            </b-button>
            <b-form-select debounce="1000" v-model="syllable" :options="syllableIdOptions" />
            <b-button class="next" size="sm" variant="outline-info" @click="nextSyllable" :disabled="!canNextSyllable">
              <b-icon icon="caret-right-fill" aria-hidden="true" />
            </b-button>
          </b-input-group>

          <SyllableIdFilter :datasource="datasource" />
        </div>
      </b-overlay>
    </b-collapse>
  </b-card>
</template>

<script lang="ts">
import Vue from "vue";
import { CountMethod, DataviewState } from "@render/store/dataview.types";
import GroupBox from "@render/components/GroupBox.vue";
import SyllableIdFilter from "@render/components/SyllableIdFilter.vue";
import { unnest } from "@render/util/Vuex";
import EditableText from "@render/components/EditableText.vue";
import { Chrome } from "vue-color";
import { getContrastingColor } from "@render/components/Charts/Colors/D3ColorProvider";

export default Vue.component("datafilter", {
  components: {
    GroupBox,
    SyllableIdFilter,
    EditableText,
    "chrome-picker": Chrome,
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
      countMethods: [
        { text: "Usage", value: CountMethod.Usage },
        { text: "Frames", value: CountMethod.Frames },
      ],
    };
  },
  computed: {
    name(): string {
      return this.datasource;
    },
    filter_name: {
      get(): string {
        if (this.dataview === undefined) {
          return "";
        }
        return this.dataview.name;
      },
      set(value: string) {
        this.$store.commit(`${this.datasource}/setName`, value);
      },
    },
    color: {
      get(): string {
        if (this.dataview === undefined) {
          return "";
        }
        return this.dataview.color;
      },
      set(value: any) {
        this.$store.commit(`${this.datasource}/setColor`, value.hex);
      },
    },
    dataview(): DataviewState {
      return unnest(this.$store.state, this.datasource);
    },
    is_loading(): boolean {
      return this.dataview && this.dataview.loading;
    },
    selectedCountMethod: {
      get(): CountMethod {
        if (this.dataview === undefined) {
          return CountMethod.Usage;
        }
        return this.dataview.countMethod;
      },
      set(value: CountMethod) {
        if (value !== this.selectedCountMethod) {
          this.$store.dispatch(`${this.datasource}/switchCountMethod`, value);
        }
      },
    },
    syllable: {
      get(): number {
        if (this.dataview === undefined) {
          return 0;
        }
        return this.dataview.selectedSyllable;
      },
      set(value: number) {
        if (value !== this.syllable) {
          this.$store.commit(`${this.datasource}/setSelectedSyllable`, value);
        }
      },
    },
    syllableIdOptions(): { value: number; text: string }[] {
      if (this.dataview === undefined) {
        return [];
      }
      const filtered = this.dataview.moduleIdFilter;
      if (filtered.length === 0) {
        const avail = this.$store.getters[`${this.datasource}/availableModuleIds`];
        return avail.map((i) => {
          return { value: i, text: i.toString() };
        });
      } else {
        return this.dataview.moduleIdFilter.map((i) => {
          return { value: i, text: i.toString() };
        });
      }
    },
    canPreviousSyllable(): boolean {
      return this.isSyllableAvailable(this.syllable - 1);
    },
    canNextSyllable(): boolean {
      return this.isSyllableAvailable(this.syllable + 1);
    },
  },
  methods: {
    removeThis() {
      if (this.$store.getters["filters/default"] === this.datasource) {
        this.$bvModal.msgBoxOk("You cannot remove the default filter.");
      } else {
        this.$bvModal.msgBoxConfirm("Are you sure you want to remove this data filter?", {}).then((value) => {
          if (value) {
            this.$store.dispatch("filters/removeFilter", this.datasource);
          }
        });
      }
    },
    getContrast(hexcolor: string): string {
      const c = getContrastingColor(hexcolor);
      if (c === "dark") {
        return "black";
      } else {
        return "white";
      }
    },
    previousSyllable() {
      const prevSyllable = this.syllable - 1;
      if (this.isSyllableAvailable(prevSyllable)) {
        this.syllable = prevSyllable;
      }
    },
    nextSyllable() {
      const nextSyllable = this.syllable + 1;
      if (this.isSyllableAvailable(nextSyllable)) {
        this.syllable = nextSyllable;
      }
    },
    isSyllableAvailable(syllableId: number) {
      return this.syllableIdOptions.find((so) => so.value === syllableId) !== undefined;
    },
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
.card-body {
  padding: 0;
  min-height: 0;
}
.filter-item {
  margin: 10px 0;
}
.filter-item:first-child {
  margin-top: 0;
}

.container {
  padding: 0.5em;
}
div.editable-text {
  display: inline;
  margin: 0 0.5em;
}
div.editable-text >>> input {
  width: calc(100% - 80px);
  display: inline-block;
}
.card-header {
  padding: 0;
}
.card-header > div {
  border-radius: calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0;
  padding: 0.25em 0.5rem;
}
.color-button {
  padding: 0;
}
.b-button,
.btn-link {
  color: inherit !important;
}
.datafilter.card {
  margin: 0px 6px 1rem 6px;
}

.selected-syllable .btn {
  border-color: #ced4da;
}
.selected-syllable .btn.prev {
  border-radius: 0;
}
.selected-syllable .btn.next {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.selected-syllable select {
  border-left: none;
  border-right: none;
}
</style>
