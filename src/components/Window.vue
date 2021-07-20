<template>
  <BaseWindow ref="window"
    :id="id"
    :titlebar_color="titlebar_color"
    :title="title"
    :width="layout.width"
    :height="layout.height"
    :position="layout.position"
    :collapsed="collapsed"
  >
  </BaseWindow>
</template>

<script lang="ts">
import BaseWindow from './BaseWindow.vue';
import mixins from 'vue-typed-mixins';
import WindowMixin from './Core/WindowMixin';

export default mixins(WindowMixin).extend({
  components: {
    BaseWindow,
  },
  data() {
    return (
      {
        collapsed: false,
      }
    );
  },
  computed: {
    settings_title(): string {
      return this.title + ' Settings';
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
  },
});
</script>

<style scoped>

</style>