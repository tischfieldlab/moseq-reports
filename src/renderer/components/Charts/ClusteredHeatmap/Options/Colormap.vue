<template>
  <b-container fluid>
    <b-row>
      <b-col>
        <b-input-group prepend="Colormap" style="flex-wrap: nowrap">
          <ColorScalePicker v-model="colormap" />
        </b-input-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-input-group prepend="vMin">
          <b-form-input type="number" v-model.number="vmin" :disabled="auto_vmin" />
          <b-input-group-append is-text>
            <b-form-checkbox v-model="auto_vmin" switch />
          </b-input-group-append>
        </b-input-group>
      </b-col>
      <b-col>
        <b-input-group prepend="vMax">
          <b-form-input type="number" v-model.number="vmax" :disabled="auto_vmax" />
          <b-input-group-append is-text>
            <b-form-checkbox v-model="auto_vmax" switch />
          </b-input-group-append>
        </b-input-group>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";
import ColorScalePicker from "@render/components/Charts/Colors/ColorScalePicker.vue";
import WindowMixin from "@render/components/Core/Window/WindowMixin";

export default mixins(WindowMixin).extend({
  components: {
    ColorScalePicker,
  },
  computed: {
    colormap: {
      get(): string {
        return this.settings.colormap;
      },
      set(value: string) {
        this.$store.commit(`${this.id}/updateComponentSettings`, {
          id: this.id,
          settings: {
            colormap: value,
          },
        });
      },
    },
    auto_vmin: {
      get(): boolean {
        return this.settings.auto_vmin;
      },
      set(value: boolean) {
        this.$store.commit(`${this.id}/updateComponentSettings`, {
          id: this.id,
          settings: {
            auto_vmin: value,
          },
        });
      },
    },
    auto_vmax: {
      get(): boolean {
        return this.settings.auto_vmax;
      },
      set(value: boolean) {
        this.$store.commit(`${this.id}/updateComponentSettings`, {
          id: this.id,
          settings: {
            auto_vmax: value,
          },
        });
      },
    },
    vmin: {
      get(): number {
        return this.settings.vmin;
      },
      set(value: number) {
        this.$store.commit(`${this.id}/updateComponentSettings`, {
          id: this.id,
          settings: {
            vmin: value,
          },
        });
      },
    },
    vmax: {
      get(): number {
        return this.settings.vmax;
      },
      set(value: number) {
        this.$store.commit(`${this.id}/updateComponentSettings`, {
          id: this.id,
          settings: {
            vmax: value,
          },
        });
      },
    },
  },
});
</script>

<style scoped></style>
