<template>
  <div v-bind:id="id" class="msqWindow"
       :style="{
          width: `${window_width}px`,
          height: `${window_height}px`,
          left: `${window_xpos}px`,
          top: `${window_ypos}px`,
       }"
  >
    <div class="msq-window-titlebar" @mousedown="dragMouseDown">
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
    dragMouseDown(event: any) {
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
    onResize(event: any) {
      this.$emit('onResized', event);
    },
    onMove(event: any) {
      this.$emit('onMoved', event);
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
