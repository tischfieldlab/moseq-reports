<template>
  <div
    v-bind:id="this.id"
    class="msqWindow"
    :style="{
      left: `${window_xpos}px`,
      top: `${window_ypos}px`,
      width: `${window_width}px`,
      height: `${window_height}px`,
      zIndex: `${z_index}`,
    }"
    style="`z-index: ${this.zindex}`"
    @click="this.onWindowFocus"
  >
    <div
      class="msq-window-titlebar noselect"
      :id="`titlebar-${this.id}`"
      @mousedown="this.onDragStart"
    >
      <span
        class="dataview-swatch"
        :id="$id('swatch')"
        :style="{ background: this.titlebar_color }"
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
        <b-button-close @click="this.onClose" class="close-button" />
      </span>
      {{ this.title }}
    </div>
    <div
      :id="`window-content-${this.id}`"
      class="window-content"
      :hidden="isCollapsed"
    >
      <slot></slot>
    </div>
    <div @mousedown="this.onResizeStart" class="noselect">
      <div :id="`r-${this.id}`" class="resizer resizer-r"></div>
      <div :id="`l-${this.id}`" class="resizer resizer-l"></div>
      <div :id="`t-${this.id}`" class="resizer resizer-t"></div>
      <div :id="`tr-${this.id}`" class="resizer resizer-tr"></div>
      <div :id="`tl-${this.id}`" class="resizer resizer-tl"></div>
      <div :id="`b-${this.id}`" class="resizer resizer-b"></div>
      <div :id="`br-${this.id}`" class="resizer resizer-br"></div>
      <div :id="`bl-${this.id}`" class="resizer resizer-bl"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Position } from "@/store/datawindow.types";
import Vue from "vue";

enum ResizeType {
  Right = "RIGHT",
  Left = "LEFT",
  Top = "TOP",
  Bottom = "BOTTOM",
  TopRight = "TOPRIGHT",
  TopLeft = "TOPLEFT",
  BottomRight = "BOTTOMRIGHT",
  BottomLeft = "BOTTOMLEFT",
  Unkown = "UNKNOWN",
}

export default Vue.extend({
  name: "BaseWindow",
  props: {
    id: { type: String, required: true },
    titlebar_color: { type: String, required: true },
    title: { type: String, required: true },
    height: { type: [Number], required: true },
    width: { type: [Number], required: true },
    pos: { type: Object, required: true },
  },
  data() {
    return {
      isCollapsed: false,
      restoredHeight: this.height,
      titlebarWidth: 36,
      windowWidth: this.width,
      windowHeight: this.height,
      windowPos: this.pos,
      // Used for window move
      isDragging: false,
      prevDeltaX: 0,
      prevDeltaY: 0,
      // Used for resize
      isResizing: false,
      resizeElement: null as EventTarget | null,
      minWidth: 260,
      minHeight: 155,
      zIndex: 1000,
    };
  },
  computed: {
    window_width(): number {
      return this.windowWidth as number;
    },
    window_height(): number {
      return this.windowHeight as number;
    },
    window_xpos(): number {
      return (this.windowPos as Position).x;
    },
    window_ypos(): number {
      return (this.windowPos as Position).y;
    },
    z_index(): number {
      return this.zIndex;
    },
  },
  methods: {
    onWindowFocus() {},
    onDrag(event: MouseEvent) {
      if (this.isDragging) {
        // event.preventDefault();
        const deltaX = event.clientX - this.prevDeltaX;
        const deltaY = event.clientY - this.prevDeltaY;

        this.prevDeltaX = event.clientX;
        this.prevDeltaY = event.clientY;

        this.windowPos.x += deltaX;
        this.windowPos.y += deltaY;
      }
    },
    onDragEnd() {
      this.prevDeltaX = 0;
      this.prevDeltaY = 0;
      this.isDragging = false;

      this.$emit("onMoved", { x: this.windowPos.x, y: this.windowPos.y });

      document.onmouseup = null;
      document.onmousemove = null;
    },
    onDragStart(event: MouseEvent) {
      this.prevDeltaX = event.clientX;
      this.prevDeltaY = event.clientY;
      this.isDragging = true;

      document.onmouseup = this.onDragEnd;
      document.onmousemove = this.onDrag;
    },
    onResizeStart(event: MouseEvent) {
      this.resizeElement = event.target;
      this.prevDeltaX = event.clientX;
      this.prevDeltaY = event.clientY;
      this.isResizing = true;

      document.onmousemove = this.onResize;
      document.onmouseup = this.onResizeEnd;
    },
    onResize(event: MouseEvent) {
      if (this.isResizing) {
        event.preventDefault();

        let deltaX = event.clientX - this.prevDeltaX;
        let deltaY = event.clientY - this.prevDeltaY;

        let newHeight = this.windowHeight;
        let newWidth = this.windowWidth;
        let newX = this.windowPos.x;
        let newY = this.windowPos.y;

        // We have to determine which resize event we are in
        // bottom vs top vs right vs left ... etc
        const resizeType: ResizeType = this.determineResizeType();
        switch (resizeType) {
          case ResizeType.Top:
            {
              newHeight = this.windowHeight - deltaY;
              newY = this.windowPos.y + deltaY;
            }
            break;

          case ResizeType.Bottom:
            {
              newHeight = this.windowHeight + deltaY;
            }
            break;

          case ResizeType.Left:
            {
              newWidth = this.windowWidth - deltaX;
              newX = this.windowPos.x + deltaX;
            }
            break;

          case ResizeType.Right:
            {
              newWidth = this.windowWidth + deltaX;
            }
            break;

          case ResizeType.BottomRight:
            {
              newWidth = this.windowWidth + deltaX;
              newHeight = this.windowHeight + deltaY;
            }
            break;

          case ResizeType.BottomLeft:
            {
              newWidth = this.windowWidth - deltaX;
              newHeight = this.windowHeight + deltaY;
              newX = this.windowPos.x + deltaX;
            }
            break;

          case ResizeType.TopLeft:
            {
              newHeight = this.windowHeight - deltaY;
              newWidth = this.windowWidth - deltaX;
              newY = this.windowPos.y + deltaY;
              newX = this.windowPos.x + deltaX;
            }
            break;

          case ResizeType.TopRight:
            {
              newHeight = this.windowHeight - deltaY;
              newY = this.windowPos.y + deltaY;
            }
            break;
        }

        this.prevDeltaX = event.clientX;
        this.prevDeltaY = event.clientY;

        if (newHeight > this.minHeight) {
          this.windowHeight = newHeight;
          this.windowPos.y = newY;
        }
        if (newWidth > this.minWidth) {
          this.windowWidth = newWidth;
          this.windowPos.x = newX;
        }
      }
    },
    onResizeEnd(event: MouseEvent) {
      this.prevDeltaY = 0;
      this.prevDeltaX = 0;
      this.isResizing = false;
      this.resizeElement = null;

      this.$emit("onResized", {
        width: this.windowWidth,
        height: this.windowHeight,
      });

      this.$emit("onMoved", {
        x: this.windowPos.x,
        y: this.windowPos.y,
      });

      document.onmouseup = null;
      document.onmousemove = null;
    },
    violatesMinSizeConstraint(
      potentialSize: number,
      constraint: number
    ): boolean {
      return potentialSize > constraint;
    },
    determineResizeType(): ResizeType {
      const topEl = document.getElementById(`t-${this.id}`);
      const botEl = document.getElementById(`b-${this.id}`);
      const leftEl = document.getElementById(`l-${this.id}`);
      const rightEl = document.getElementById(`r-${this.id}`);
      const botRightEl = document.getElementById(`br-${this.id}`);
      const botLeftEl = document.getElementById(`bl-${this.id}`);
      const topRightEl = document.getElementById(`tr-${this.id}`);
      const topLeftEl = document.getElementById(`tl-${this.id}`);

      switch (this.resizeElement) {
        case topEl:
          return ResizeType.Top;
        case botEl:
          return ResizeType.Bottom;
        case leftEl:
          return ResizeType.Left;
        case rightEl:
          return ResizeType.Right;
        case botRightEl:
          return ResizeType.BottomRight;
        case botLeftEl:
          return ResizeType.BottomLeft;
        case topRightEl:
          return ResizeType.TopRight;
        case topLeftEl:
          return ResizeType.TopLeft;
      }

      return ResizeType.Unkown;
    },
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
      this.isCollapsed = !this.isCollapsed;

      if (this.$data.isCollapsed) {
        this.$data.restoredHeight = this.$data.windowHeight;
        this.$data.windowHeight = this.$data.titlebarWidth;
      } else {
        this.$data.windowHeight = this.$data.restoredHeight;
      }
    },
  },
});
</script>

<style scoped>
.resizer {
  position: absolute;
}

.resizer-r {
  cursor: ew-resize;
  height: 100%;
  right: 0;
  top: 0;
  width: 5px;
}

.resizer-l {
  cursor: ew-resize;
  height: 100%;
  left: 0;
  top: 0;
  width: 5px;
}

/* Placed at the bottom side */
.resizer-b {
  bottom: 0;
  cursor: ns-resize;
  height: 5px;
  left: 0;
  width: 100%;
}

.resizer-br {
  bottom: 0;
  cursor: nw-resize;
  height: 5px;
  right: 0;
  width: 5px;
}

.resizer-bl {
  bottom: 0;
  cursor: ne-resize;
  height: 5px;
  left: 0;
  width: 5px;
}

.resizer-t {
  top: 0;
  cursor: ns-resize;
  height: 5px;
  left: 0;
  width: 100%;
}

.resizer-tl {
  top: 0;
  cursor: nw-resize;
  height: 5px;
  left: 0;
  width: 5px;
}

.resizer-tr {
  top: 0;
  cursor: ne-resize;
  height: 5px;
  right: 0;
  width: 5px;
}

.msqWindow {
  background-color: white;
  border: 1px solid darkgray;
  position: absolute;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: 2px 5px 5px rgba(128, 128, 128, 0.816);
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
  margin-top: 1px;
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
  right: 68px;
  cursor: pointer;
  margin-top: -1px;
  color: #747474;
}

.snapshot-button:hover {
  color: #3a3a3a;
}

.settings-button {
  width: 16px;
  height: 16px;
  margin-right: 7px;
  margin-left: 0px;
  position: absolute;
  right: 44px;
  cursor: pointer;
  margin-top: -1px;
  color: #747474;
}

.settings-button:hover {
  color: #3a3a3a;
}

.min-max-button {
  width: 16px;
  height: 16px;
  margin-right: 0px;
  margin-left: 0px;
  position: absolute;
  right: 30px;
  margin-top: 0px;
  cursor: pointer;
  margin-top: -1px;
  color: #747474;
}

.min-max-button:hover {
  color: #3a3a3a;
}

.close-button {
  width: 20px;
  height: 20px;
  /* color: black; */
  display: inline-block;
  position: absolute;
  right: 8px;
  margin-top: -4px;
  cursor: pointer;
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