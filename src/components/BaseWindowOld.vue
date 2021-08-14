<template>
  <div
    v-bind:id="this.$props.id"
    class="msqWindow"
    :style="{
      left: `${window_xpos}px`,
      top: `${window_ypos}px`,
    }"
    :w="window_width"
    :h="window_height"
    @resizing="onResizing"
    @dragging="onDragging"
    @dragstop="onDragStop"
    :stickSize="12"
  >
    <div
      class="msq-window-titlebar noselect"
      :id="`titlebar-${this.$props.id}`"
    >
      <span
        class="dataview-swatch"
        :id="$id('swatch')"
        :style="{ background: this.$props.titlebar_color }"
        :title="this.$props.title"
      >
        <b-icon
          @click="this.onSnapshotClicked"
          icon="camera-fill"
          class="snapshot-button"
        />
        <b-icon
          @click="this.onSettingsClicked"
          icon="gear-fill"
          class="settings-button"
        />
        <b-icon
          @click="this.onCollapsedClicked"
          icon="caret-down-fill"
          class="min-max-button"
          v-if="!isCollapsed"
        />
        <b-icon
          @click="this.onCollapsedClicked"
          icon="caret-up-fill"
          class="min-max-button"
          v-else
        />
        <b-icon @click="this.onClose" icon="x" class="close-button" />
      </span>
      {{ this.$props.title }}
    </div>
    <div :id="`window-content-${this.$props.id}`" :hidden="isCollapsed">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Position } from "@/store/datawindow.types";
import Vue from "vue";
import { throttle } from "lodash";

export default Vue.component("BaseWindow", {
  props: {
    id: { type: String, required: true },
    titlebar_color: { type: String, required: true },
    title: { type: String, required: true },
    height: { type: [Number, String], required: true },
    width: { type: [Number, String], required: true },
    position: { type: Object, required: true },
  },
  data() {
    return {
      isCollapsed: false,
      titleBarWidth: 35,
      restoredHeight: this.$props.height,
      id: this.$props.id,
      position: this.$props.position,
      height: this.$props.height,
      width: this.$props.width,
      throttledResize: null,
      throttledMove: null,
      prevLeft: 0,
      prevTop: 0,
    };
  },
  computed: {
    window_width() {
      return this.width;
    },
    window_height() {
      return this.height;
    },
    window_xpos() {
      return (this.position as Position).x;
    },
    window_ypos() {
      return (this.position as Position).y;
    },
  },
  methods: {
    onResizing({ left, top, width, height }) {
      this.$props.width = width;
      this.$props.height = height;

      const f = ({ width, height }) => {
        this.$emit("onResized", { width: width, height: height });
      };

      if (this.$data.throttledResize === null) {
        this.$data.throttledResize = throttle(f, 150);
      }

      this.$data.throttledResize({ width: width, height: height });
    },
    onDragging({ left, top }) {
      const titleElement: HTMLElement | null = document.getElementById(
        "titlebar-" + this.$data.id
      );
      const titleRect: DOMRect = titleElement!.getBoundingClientRect();

      // NOTE: this means we are in the title bar
      if (
        left >= titleRect.x &&
        left <= titleRect.x + titleRect.width &&
        top >= titleRect.y &&
        top <= titleRect.y + titleRect.height
      ) {
        console.log("here");
      }

      if (this.$data.prevTop === 0) this.$data.prevTop = top;
      if (this.$data.prevLeft === 0) this.$data.prevLeft = left;

      const deltaY = this.$data.prevTop - top;
      const deltaX = this.$data.prevLeft - left;

      this.$props.position.x -= deltaX;
      this.$props.position.y -= deltaY;

      this.$data.prevTop = top;
      this.$data.prevLeft = left;

      this.$emit("onMoved", {
        x: this.$props.position.x,
        y: this.$props.position.y,
      });
    },
    onDragStop() {},
    onClose(event: any) {
      this.$emit("onClosed", event);
    },
    onSettingsClicked(event: any) {
      this.$emit("onSettingsClicked", event);
    },
    onSnapshotClicked(event: any) {
      this.$emit("onSnapshotClicked", event);
    },
    onCollapsedClicked(event: any) {
      this.$data.isCollapsed = !this.$data.isCollapsed;
      this.$emit("onCollapsedClicked", event);

      // If the widget is collapsed, we want to hide and shrink it.
      if (this.$data.isCollapsed) {
        // Save the restore height
        this.$data.restoredHeight = this.$props.height;
        this.$props.height = this.$data.titleBarWidth;
      } else {
        this.$props.height = this.$data.restoredHeight;
      }
    },
  },
});
</script>

<style>
.msqWindow {
  background-color: white;
  border: 1px solid darkgray;
  position: absolute;
  overflow: hidden;
  border-radius: 2px;
  /* resize: both; */
}
.msq-window-titlebar {
  padding-top: 5px;
  color: black;
  padding-bottom: 5px;
  margin-left: -5px;
  padding-left: 12px;
  border-bottom: 1px solid darkgray;
  background-color: #e8e8e8;
}
.dataview-swatch {
  display: inline-block;
  vertical-align: text-top;
  width: 16px;
  height: 16px;
  border-radius: 16px;
  border: 1px solid #c5c5c5;
  cursor: default;
}

.snapshot-button {
  width: 16px;
  height: 16px;
  margin-right: 7px;
  margin-left: 0px;
  position: absolute;
  right: 52px;
  cursor: pointer;
}

.snapshot-button:hover {
  color: gray;
}

.settings-button {
  width: 16px;
  height: 16px;
  margin-right: 7px;
  margin-left: 0px;
  position: absolute;
  right: 31px;
  cursor: pointer;
}

.settings-button:hover {
  color: gray;
}

.min-max-button {
  width: 16px;
  height: 16px;
  margin-right: 0px;
  margin-left: 0px;
  position: absolute;
  right: 20px;
  cursor: pointer;
}

.min-max-button:hover {
  color: gray;
}

.close-button {
  width: 20px;
  height: 20px;
  /* color: black; */
  display: inline-block;
  position: absolute;
  right: 2px;
  margin-top: -2px;
  cursor: pointer;
}

.close-button:hover {
  color: gray;
}

.noselect {
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome, Edge, Opera and Firefox */
}
</style>