<template>
  <div v-bind:id="id" class="msqWindow" @mousedown="onWindowClick" @mousemove="onMouseMove"
       :style="{
          width: `${window_width}px`,
          height: `${window_height}px`,
          left: `${window_xpos}px`,
          top: `${window_ypos}px`,
       }"
  >
    <div class="msq-window-titlebar" :id="`titlebar-${id}`">
      <span class="dataview-swatch" :id="$id('swatch')" :style="{background: titlebar_color}" :title="title">
        <img src="/img/gear.png" class="settings-button" v-on:click="onSettingsClicked" />
        <img src="/img/camera.png" class="snapshot-button" v-on:click="onSnapshotClicked" />
        <p class="close-button" v-on:click="onClose">X</p>
      </span>
      {{ title }}
    </div>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {throttle} from '@/util/Events';

export default Vue.component('BaseWindow', {
  props: {
    disabled: {type: Boolean, default: false},
    height: {type: [Number, String], required: true},
    width: {type: [Number, String], required: true},
    minHeight: {type: Number, default: 100},
    maxHeight: {type: Number, default: 900},
    minWidth: {type: Number, default: 100},
    maxWidth: {type: Number, default: 900},
    position: {type: [String, Object], required: true},
    zIndex: {type: Number, default: -1},
    resizable: {type: Boolean, default: true},
    draggable: {type: Boolean, default: true},
    collapsed: {type: Boolean, default: false},
    title: {type: String, required: true},
    id: String,
    titlebar_color: String,
  },
  data() {
    return {
      disabled: this.$props.disabled,
      height: this.$props.height,
      width: this.$props.width,
      minHeight: this.$props.minHeight,
      maxHeight: this.$props.maxHeight,
      minWidth: this.$props.minWidth,
      maxWidth: this.$props.maxWidth,
      position: this.$props.position,
      zIndex: this.$props.zIndex,
      resizable: this.$props.resizable,
      draggable: this.$props.draggable,
      collapsed: this.$props.collapsed,
      title: this.$props.title,
      id: this.$props.id,
      titlebar_color: this.$props.titlebar_color,
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
      return (this.position as any).x;
    },
    window_ypos() {
      return (this.position as any).y;
    }
  },
  methods: {
    onClose(event: any) {
      this.$emit('onClosed', event);
    },
    onSettingsClicked(event: any) {
      this.$emit('onSettingsClicked', event);
    },
    onSnapshotClicked(event: any) {
      this.$emit('onSnapshotClicked', event);
    },
    isAtBorder(x: number, y: number) {
      const element: HTMLElement|null = document.getElementById(this.$data.id);
      const titleBar: HTMLElement|null = document.getElementById('titlebar-' + this.$data.id);
      const titleBarRect: DOMRect = titleBar!.getBoundingClientRect();
      const rect: DOMRect = element!.getBoundingClientRect();

      const topBorder: number = rect.y;
      const bottomBorder: number = rect.y + rect.height;
      const leftBorder: number = rect.x;
      const rightBorder: number = rect.x + rect.width;

      // NOTE: this is the number of pixels from each border in which to
      // register a resize drag event
      const delta: number = 6;

      let leftResize: boolean = false;
      let rightResize: boolean = false;
      let bottomResize: boolean = false;
      // NOTE: check if we are at the right border but ignore the top bar
      if (x >= (rightBorder - delta) && x <= rightBorder && y >= (topBorder + titleBarRect.height)) {
        rightResize = true;
      }

      // NOTE: check if we are at the left border but ignore the top bar
      if (x >= leftBorder && x <= (leftBorder + delta) && y >= (topBorder + titleBarRect.height)) {
        leftResize = true;
      }

      // NOTE: check if we are at the bottom border
      if (y >= (bottomBorder - delta) && y <= bottomBorder) {
        bottomResize = true;
      }

      const res: any = {};
      res['left'] = leftResize;
      res['right'] = rightResize;
      res['bottom'] = bottomResize;
      return res;
    },
    onMouseMove(event: any) {
      event = event || window.event;
      event.preventDefault();

      const borderRes: any = this.isAtBorder(event.x, event.y);
      if (borderRes['left'] && borderRes['bottom']) {
        document.body.style.cursor = 'nesw-resize';
      } else if (borderRes['right'] && borderRes['bottom']) {
        document.body.style.cursor = 'nwse-resize';
      } else if (borderRes['right'] || borderRes['left']) {
        document.body.style.cursor = 'ew-resize';
      } else if (borderRes['bottom']) {
        document.body.style.cursor = 'ns-resize';
      } else {
        document.body.style.cursor = 'default';
      }
    },
    onWindowClick(event: any) {
      if (this.$data.draggable === false) return;

      event = event || window.event;
      event.preventDefault();

      const titleElement: HTMLElement|null = document.getElementById('titlebar-' + this.$data.id);
      const titleRect: DOMRect = titleElement!.getBoundingClientRect();

      const x: number = event.x;
      const y: number = event.y;

      // NOTE: this means we are in the title bar
      if (x >= titleRect.x && x <= (titleRect.x + titleRect.width)
        && y >= titleRect.y && y <= (titleRect.y + titleRect.height)) {
          this.dragMouseTitlebar(event);
          return;
      }

      // NOTE: this means we are trying to resize the window
      let prevX: number = event.x;
      let prevY: number = event.y;
      document.onmousemove = (e: any) => {
        const deltaX: number = e.x - prevX;
        const deltaY: number = e.y - prevY;

        this.$data.height += deltaY;
        this.$data.width += deltaX;

        const resizedObj: any = {
          width: this.$data.width,
          height: this.$data.height,
        };

        this.$emit('onResized', resizedObj);
        prevX += deltaX;
        prevY += deltaY;
      }

      document.onmouseup = (e: any) => {
        document.onmouseup = null;
        document.onmousemove = null;
      };
    },
    dragMouseTitlebar(event: any) {
      let prevX: number = event.x;
      let prevY: number = event.y;
      document.onmousemove = (e: any) => {
        const deltaX: number = e.x - prevX;
        const deltaY: number = e.y - prevY;

        const resizedObj: any = {
          x: deltaX,
          y: deltaY
        };

        this.$data.position.x += deltaX;
        this.$data.position.y += deltaY;

        // this.$emit('onMoved', resizedObj);
        throttle(() => this.$emit('onMoved', resizedObj), 10);
        prevX += deltaX;
        prevY += deltaY;
      }

      document.onmouseup = (e: any) => {
        document.onmouseup = null;
        document.onmousemove = null;
      };
    }
  }
});
</script>

<style>
.msqWindow {
  background-color: white;
  border: 1px solid black;
  border-radius: 10px;
  position: absolute;
  overflow: hidden;
}

.msq-window-titlebar {
  padding-left: 5px;
  border-bottom: 1px solid black;
  border-top-right-radius: 10px;
  border-top-left-radius: 10px;
  background-color: #e6e6e6;
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

.settings-button{
  width: 16px;
  height: 16px;
  margin-right: 7px;
  margin-left: 0px;
  position: absolute;
  right: 20px;
  cursor:pointer;
}

.snapshot-button{
  width: 16px;
  height: 16px;
  margin-right: 7px;
  margin-left: 0px;
  position: absolute;
  right: 42px;
  cursor:pointer;
}

.close-button {
  color: red;
  display: inline-block;
  position: absolute;
  right: 10px;
  margin-top: -2px;
  cursor: pointer;
}

</style>
