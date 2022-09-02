<template>
  <b-container>
    <b-row>
      <b-col>
        <b-input-group prepend="Preferred Renderer">
          <b-form-select v-model="renderer" :options="supported_renderers" />
        </b-input-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-input-group prepend="Output Format">
          <b-form-select v-model="format" :options="supported_formats" />
        </b-input-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-input-group prepend="Quality" :append="quality_str">
          <b-form-input debounce="150" v-model.number="quality" type="range" min="0" max="100"></b-form-input>
        </b-input-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-input-group prepend="Scale">
          <b-form-input v-model.number="scale" type="number" min="0" max="10"></b-form-input>
        </b-input-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-input-group prepend="Background Color">
          <chrome-picker :value="backgroundColor" @input="backgroundColorChanged" />
        </b-input-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-button ref="snapshot_button" @click="takeSnapshot()" class="float-right" :disabled="is_taking_snapshot">
          <b-spinner v-show="is_taking_snapshot" small type="grow" />
          <b-icon v-show="!is_taking_snapshot" icon="camera-fill" />
          Take Snapshot
        </b-button>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import Vue from "vue";
import Snapshot, { resolveTarget } from "@render/components/Core/SnapshotHelper";
import mixins from "vue-typed-mixins";
import WindowMixin from "@render/components/Core/Window/WindowMixin";
import { Chrome } from "vue-color";
import { RenderMode } from "@render/store/datawindow.types";
import WindowManager from "@render/components/Core/Window/WindowManager";

export default mixins(WindowMixin).extend({
  components: {
    "chrome-picker": Chrome,
  },
  data() {
    return {
      is_taking_snapshot: false,
      quality_str: "",
    };
  },
  beforeMount() {
    this.updateQualityStr();
  },
  computed: {
    supported_renderers(): string[] {
      return this.spec.available_render_modes;
    },
    supported_formats(): string[] {
      switch (this.renderer) {
        case RenderMode.CANVAS:
          return ["png"];
        case RenderMode.SVG:
          return ["svg", "png"];
        case RenderMode.VIDEO:
          return ["video", "png"];
        case RenderMode.HTML:
          return ["png"];
        case RenderMode.UNDEFINED:
        default:
          // tslint:disable-next-line:no-console
          console.warn(`Invalid Render Mode '${this.renderer}`);
          return [];
      }
    },
    renderer: {
      get(): string {
        return this.$wstate.render_mode;
      },
      set(value: string) {
        this.$store.commit(`${this.id}/updateComponentRenderMode`, {
          render_mode: value as RenderMode,
        });
      },
    },
    snapshot_settings(): any {
      return this.settings.snapshot;
    },
    format: {
      get(): string {
        return this.snapshot_settings.format;
      },
      set(value: string) {
        this.$store.commit(`${this.id}/updateComponentSettings`, {
          id: this.id,
          settings: {
            snapshot: {
              format: value,
            },
          },
        });
      },
    },
    quality: {
      get(): number {
        return this.snapshot_settings.quality * 100;
      },
      set(value: number) {
        this.$store.commit(`${this.id}/updateComponentSettings`, {
          id: this.id,
          settings: {
            snapshot: {
              quality: value / 100,
            },
          },
        });
        this.updateQualityStr();
      },
    },
    scale: {
      get(): number {
        return this.snapshot_settings.scale;
      },
      set(value: number) {
        this.$store.commit(`${this.id}/updateComponentSettings`, {
          id: this.id,
          settings: {
            snapshot: {
              scale: value,
            },
          },
        });
      },
    },
    backgroundColor: {
      get(): string {
        return this.snapshot_settings.backgroundColor;
      },
      set(value: string) {
        this.$store.commit(`${this.id}/updateComponentSettings`, {
          id: this.id,
          settings: {
            snapshot: {
              backgroundColor: value,
            },
          },
        });
      },
    },
  },
  methods: {
    getComponent(): Vue {
      return WindowManager.getWindowByID(this.id)!;
    },
    updateQualityStr() {
      this.quality_str = `${(this.snapshot_settings.quality * 100).toFixed(0)}%`;
    },
    takeSnapshot() {
      this.is_taking_snapshot = true;
      this.$forceNextTick(() => {
        Snapshot(this.getComponent(), this.title, this.snapshot_settings).finally(
          () => (this.is_taking_snapshot = false)
        );
      });
    },
    backgroundColorChanged(event) {
      this.backgroundColor = event.hex;
    },
  },
});
</script>

<style>
.row {
  margin: 10px 0;
}
</style>
