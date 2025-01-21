import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import { ComponentRegistration } from "@render/store/root.types";
import { DataWindowState, Layout } from "@render/store/datawindow.types";
import { unnest } from "@render/util/Vuex";
import { DataviewState } from "@render/store/dataview.types";

export function useWindowMixin(id: string) {
  const store = useStore();

  // Computed Properties
  const subid = computed(() => id.replace("datawindows/", ""));
  const $wstate = computed(() => store.state.datawindows[subid.value] as DataWindowState);
  const spec = computed(() => store.getters[`${id}/spec`] as ComponentRegistration);
  const datasource = computed(() => $wstate.value.datasource);
  const dataview = computed(() => unnest(store.state, datasource.value) as DataviewState);
  const settings = computed(() => $wstate.value.settings);
  const layout = computed(() => ({
    height: $wstate.value.height,
    width: $wstate.value.width,
    position: {
      x: $wstate.value.pos_x,
      y: $wstate.value.pos_y,
    },
  }) as Layout);
  const title = computed(() => $wstate.value.title);
  //const aspect_ratio = computed(() => store.getters[`${id}/aspectRatio`]);

  return {
    subid,
    $wstate,
    //aspect_ratio,
    spec,
    datasource,
    dataview,
    settings,
    layout,
    title,
  };
}

export default defineComponent({
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    // Use the mixin function
    const mixin = useWindowMixin(props.id);

    return {
      ...mixin,
    };
  },
});
