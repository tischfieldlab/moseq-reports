<template>
  <div v-bind:id="id" class="msqWindow" @mousedown="dragMouseBorder"
       :style="{
          width: `${window_width}px`,
          height: `${window_height}px`,
          left: `${window_xpos}px`,
          top: `${window_ypos}px`,
       }"
  >
    <div class="msq-window-titlebar" @mousedown="dragMouseTitlebar" :id="`titlebar-${id}`">
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
import {left, right} from '@popperjs/core';

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
    dragMouseBorder(event: any) {
      if (this.$data.resizable === false) return;

      event = event || window.event;
      event.preventDefault();

      // Make sure we are near the edges
      const x: number = event.clientX;
      const y: number = event.clientY;

      const titleBar = document.getElementById('titlebar-' + this.$data.id);
      const wind = document.getElementById(this.$data.id);

      // This controls how much space we should allow for the resize events to happen
      const delta: number = 5;
      const leftBorder: number = this.$data.position.x;
      const rightBorder: number = this.$data.position.x + this.$data.width;
      const topBorder: number = this.$data.position.y;
      const titleBarHeight: number = titleBar!.clientHeight;
      const bottomBorder: number = this.$data.position.y + this.$data.height;

      let resizeRight: boolean = false;
      let resiseLeft: boolean = false;
      let resizeBottom: boolean = false;

      console.log(x, y, bottomBorder);

      // If we are resizing from right border, but not where the titlebar is
      if (x >= (rightBorder - delta) && x <= rightBorder && y >= (topBorder + 2.1 * titleBarHeight)) {
        resizeRight = true;
        console.log('resize right');
      }

      if (x >= leftBorder && x <= (leftBorder + delta) && y >= (topBorder + 2.1 * titleBarHeight)) {
        resiseLeft = true;
        console.log('resize left');
      }
    },
    dragMouseTitlebar(event: any) {
      if (this.$data.draggable === false) return;

      event = event || window.event;
      event.preventDefault();

      let prevX: number = event.clientX;
      let prevY: number = event.clientY;
      document.onmousemove = (e: any) => {
        const deltaX: number = e.clientX - prevX;
        const deltaY: number = e.clientY - prevY;

        const resizedObj: any = {
          x: deltaX,
          y: deltaY
        };

        this.$data.position.x += deltaX;
        this.$data.position.y += deltaY;

        this.$emit('onMoved', resizedObj);
        prevX += deltaX;
        prevY += deltaY;
      }

      document.onmouseup = (e: any) => {
        document.onmouseup = null;
        document.onmousemove = null;
      };
    },
    onClose(event: any) {
      this.$emit('onClosed', event);
    },
    onSettingsClicked(event: any) {
      this.$emit('onSettingsClicked', event);
    },
    onSnapshotClicked(event: any) {
      this.$emit('onSnapshotClicked', event);
    },
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
