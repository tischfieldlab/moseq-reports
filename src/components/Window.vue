<template>
  <BaseWindow
    ref="window"
    :id="id"
    :titlebar_color="titlebar_color"
    :title="title"
    :width="layout.width"
    :height="layout.height"
    :pos="layout.position"
    @onClosed="onClosed"
    @onSettingsClicked="onSettingsClicked"
    @onSnapshotClicked="onSnapshotClicked"
    @onMoved="onMoved"
    @onResized="onResized"
  >
    <div>
      <b-overlay :show="is_loading" no-fade>
        <component ref="body" :id="id" :is="spec.component_type" />
      </b-overlay>

      <b-modal
        :title="settings_title"
        v-model="show_settings_modal"
        header-bg-variant="dark"
        header-text-variant="light"
        body-bg-variant="light"
        body-text-variant="dark"
        hide-footer
      >
        <b-tabs>
          <b-tab title="Layout">
            <LayoutSettings :id="id" />
          </b-tab>
          <b-tab title="Data">
            <DataSettings :id="id" />
          </b-tab>
          <b-tab title="Component">
            <component
              v-if="spec.settings_type"
              ref="modal_component"
              :id="id"
              :is="spec.settings_type"
            />
            <p v-else class="no-settings text-muted">
              No settings available for this component
            </p>
          </b-tab>
          <b-tab title="Snapshots">
            <SnapshotSettings :id="id" />
          </b-tab>
        </b-tabs>
      </b-modal>
    </div>
  </BaseWindow>
</template>

<script lang="ts">
import BaseWindow from "./BaseWindow.vue";
import mixins from "vue-typed-mixins";
import WindowMixin from "./Core/WindowMixin";
import Snapshot, { ensureDefaults } from "./Core/SnapshotHelper";
import { Layout, Position, Size } from "@/store/datawindow.types";
export default mixins(WindowMixin).extend({
  components: {
    BaseWindow,
  },
  mounted() {
    this.$nextTick().then(() => {
      // this.updateWindowLayout(this.layout);
      ensureDefaults(this.$refs.body as Vue, this.$store);
    });
    (this.$refs.body as Vue).$on("start-loading", () => {
      this.component_loading++;
    });
    (this.$refs.body as Vue).$on("finish-loading", () => {
      this.component_loading = clamp(this.component_loading - 1, 0);
    });
  },
  data() {
    return {
      show_settings_modal: false,
      component_loading: 0,
      watchers: Array<() => void>(),
    };
  },
  computed: {
    settings_title(): string {
      return this.title + " Settings";
    },
    max_width(): number {
      return window.innerWidth;
    },
    max_height(): number {
      return window.innerHeight - 30;
    },
    titlebar_color(): string {
      return this.dataview.color;
    },
    swatch_title(): string {
      return `Using ${this.dataview.name}`;
    },
    is_loading(): boolean {
      const s = this.dataview;
      return this.component_loading > 0 || (s && s.loading);
    },
  },
  watch: {
    layout: {
      deep: true,
      handler(newValue: Layout) {
        // this.updateWindowLayout(newValue);
      },
    },
    title(newValue) {
      (this.$refs.window as any).title = newValue;
    },
    titlebar_color: {
      handler(newValue) {
        const swatch = document.getElementById(this.$id("swatch"));
        if (swatch) swatch.style.backgroundColor = newValue;
      },
    },
    swatch_title: {
      handler(newValue) {
        const swatch = document.getElementById(this.$id("swatch"));
        if (swatch) swatch.title = newValue;
      },
    },
  },
  methods: {
    // updateWindowLayout(layout: Layout) {
    //   (this.$refs.window as any).width = layout.width;
    //   (this.$refs.window as any).height = layout.height;
    //   (this.$refs.window as any).position = {
    //     x: layout.position.x,
    //     y: layout.position.y,
    //   } as Position;
    // },
    onResized(event: any) {
      const s: Size = {
        width: event.width,
        height: event.height,
      };
      this.$store.commit(`${this.id}/updateComponentLayout`, {
        id: this.id,
        width: s.width,
        height: s.height,
      });
    },
    onSettingsClicked(event: any) {
      this.show_settings_modal = true;
    },
    onSnapshotClicked(event: any) {
      this.snapshotContent(event);
    },
    onMoved(event: any) {
      const p: Position = {
        x: event.x,
        y: event.y,
      };

      this.$store.commit(`${this.id}/updateComponentLayout`, {
        id: this.id,
        position_x: p.x,
        position_y: clamp(p.y, 0),
      });
    },
    onClosed(event: any) {
      this.$store.dispatch("datawindows/removeWindow", this.id);
    },
    async snapshotContent(event: MouseEvent) {
      await Snapshot(
        this.$refs.body as Vue,
        this.title,
        this.settings.snapshot
      );
    },
  },
});

function clamp(value: number, min = Number.MIN_VALUE, max = Number.MAX_VALUE) {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}
</script>

<style scoped>
</style>