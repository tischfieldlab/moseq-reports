<template>
  <div class="custom-window" ref="window">
    <!--  This is the where the top bar stuff exists  -->
    <div class="custom-window-top-bar" @mousedown="dragMouseDown">
      <p class="custom-window-title">Title</p>
      <p class="close-image-button" v-on:click="onClosed($event)">x</p>
      <img class="window-icon-button" src="/img/gear.png"
           v-on:click="settingsClick($event)"
      />
      <img class="window-icon-button" src="/img/camera.png" />
    </div>

    <!--  This is where the body of the window exists  -->
    <div class="custom-window-body">

      <!-- This is where a component goes -->
      <b-overlay :show="is_loading" no-fade>
      </b-overlay>

      <!-- For settings and top bar button clicks -->
      <b-modal
          title="Test"
          v-model="show_settings_modal"
          header-bg-variant="dark"
          header-text-variant="light"
          body-bg-variant="light"
          body-text-variant="dark"
          hide-footer>
        <b-tabs>
          <b-tab title="Layout"></b-tab>
          <b-tab title="Data"></b-tab>
          <b-tab title="Component"></b-tab>
          <b-tab title="Snapshots"></b-tab>
        </b-tabs>

      </b-modal>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import mixins from 'vue-typed-mixins';
import { Size, Position, Layout } from '@/store/datawindow.types';
import WindowMixin from '@/components/Core/WindowMixin';

export default mixins(WindowMixin).extend({
  data() {
    return {
      component_loading: 0,
      show_settings_modal: false,
      pos1: 0,
      pos2: 0,
      pos3: 0,
      pos4: 0,
      watchers: Array<(() => void)>(),
    }
  },
  computed: {
    is_loading(): boolean {
      // const s = this.dataview;
      // return this.component_loading > 0 || (s && s.loading);
      return false;
    },
    settings_title(): string {
      return this.title + ' Settings';
    },
    max_width(): number {
      return window.innerWidth;
    },
    titlebar_color(): string {
      return this.dataview.color;
    },
    swatch_title(): string {
      return `Using ${this.dataview.name}`;
    }
  },
  methods: {
    settingsClick(event: any) {
      this.show_settings_modal = true;
    },
    onResized(event: any) {
      const s = event.args as Size;
      this.$store.commit(`${this.id}/UpdateComponentLayout`, {
        id: this.id,
        width: s.width,
        height: s.height,
      });
    },
    onClosed(event: any) {
      // this.$store.dispatch('datawindows/removeWindow', this.id);
    },
    dragMouseDown(e: any) {
      e = e || window.event;
      e.preventDefault();
      this.pos3 = e.clientX;
      this.pos4 = e.clientY;
      document.onmouseup = this.closeDragElement;
      console.log(this.pos1, this.pos2, this.pos3, this.pos4);
    },
    closeDragElement(e: any) {
      e = e || window.event;
      e.preventDefault();
      document.onmouseup = null;
      document.onmousemove = null;

      // calculate the new cursor position:
      this.pos1 = this.pos3 - e.clientX;
      this.pos2 = this.pos4 - e.clientY;
      this.pos3 = e.clientX;
      this.pos4 = e.clientY;

      console.log(this.pos1, this.pos2, this.pos3, this.pos4);
    },
  }
});
</script>

<style>
.custom-window {
  width: 500px;
  height: 800px;
  left: 80px;
  position: absolute;
  background-color: white;
  border: 1px solid gray;
  border-radius: 10px;
  margin-top: 10px;
  resize: both;
  overflow: auto;
}

.custom-window-top-bar {
  width: 498px;
  height: 30px;
  background-color: #f0f0f0;
  border-bottom: 1px solid gray;
  border-radius: 10px;
  border-bottom-right-radius: 0px;
  border-bottom-left-radius: 0px;
}

.custom-window-title {
  padding-left: 10px;
  padding-top: 5px;
  display: inline-block;
}
.window-icon-button {
  width: 20px;
  height: 20px;
  display: inline-block;
  float: right;
  margin-top: 6px;
  margin-right: 8px;
}

.window-icon-button:hover {
  cursor: pointer;
}

.close-image-button {
  display: inline-block;
  float: right;
  font-size: large;
  font-weight: bold;
  padding-top: 2px;
  padding-right: 10px;
  color: #696969;
}

.close-image-button:hover {
  cursor: pointer;
}

</style>
