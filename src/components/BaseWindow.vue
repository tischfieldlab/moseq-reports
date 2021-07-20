><template>
  <div v-bind:id="this.$props.id"
    class="msqWindow"
    :style="{
      width: `${window_width}px`,
      height: `${window_height}px`,
      left: `${window_xpos}px`,
      top: `${window_ypos}px`,
    }"
  >
    <div clas="msq-window-titlebar" :id="`titlebar-${this.$props.id}`">
      <span class="dataview-swatch"
        :id="$id('swatch')"
        :style="{background: this.$props.titlebar_color}"
        :title="this.$props.title"
      >
        <b-icon icon="camera" class="snapshot-button" />
        <b-icon icon="gear-wide" class="settings-button" />
        <b-icon icon="caret-up-fill" class="min-max-button" />
        <b-icon icon="x" class="close-button" />
      </span>
      {{ this.$props.title }}
    </div>
    <div :id="`window-content-${this.$props.id}`" :hidden="`${this.$props.collapsed}`">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.component('BaseWindow', {
  props: {
    id: {type: String, required: true},
    titlebar_color: {type: String, required: true},
    title: {type: String, required: true},
    height: {type: [Number, String], required: true},
    width: {type: [Number, String], required: true},
    position: {type: Object, required: true},
    collapsed: {type: Boolean, required: true },
  },
  data() {
    return {
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
    },
  },
});
</script>

<style>
.msqWindow {
  padding-left: 5px;
  background-color: white;
  border: 1px solid black;
  position: absolute;
  overflow: hidden;
}

.msq-window-titlebar {
  padding-left: 5px;
  border-bottom: 2px solid black;
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

.snapshot-button{
  width: 16px;
  height: 16px;
  margin-right: 7px;
  margin-left: 0px;
  position: absolute;
  right: 52px;
  cursor:pointer;
}

.settings-button{
  width: 16px;
  height: 16px;
  margin-right: 7px;
  margin-left: 0px;
  position: absolute;
  right: 31px;
  cursor:pointer;
}

.min-max-button{
  width: 16px;
  height: 16px;
  margin-right: 0px;
  margin-left: 0px;
  position: absolute;
  right: 20px;
  cursor:pointer;
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
</style>