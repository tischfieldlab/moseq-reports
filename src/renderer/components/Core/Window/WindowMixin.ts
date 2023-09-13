import {defineComponent} from "vue";
import { ComponentRegistration } from "@render/store/root.types";
import { DataWindowState, Layout } from "@render/store/datawindow.types";
import { unnest } from "@render/util/Vuex";
import { DataviewState } from "@render/store/dataview.types";

const WindowMixin = defineComponent({
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  computed: {
    subid(): string {
      return this.id.replace("datawindows/", "");
    },
    $wstate(): DataWindowState {
      return this.$store.state.datawindows[this.subid] as DataWindowState;
    },
    spec(): ComponentRegistration {
      return this.$store.getters[`${this.id}/spec`];
    },
    datasource(): string {
      return this.$wstate.datasource;
    },
    dataview(): DataviewState {
      return unnest(this.$store.state, this.datasource);
    },
    settings(): any {
      return this.$wstate.settings;
    },
    layout(): Layout {
      return {
        height: this.$wstate.height,
        width: this.$wstate.width,
        position: {
          x: this.$wstate.pos_x,
          y: this.$wstate.pos_y,
        },
      };
    },
    title(): string {
      return this.$wstate.title;
    },
  },
});
export default WindowMixin;
