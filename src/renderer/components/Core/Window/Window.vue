<template>
  <BaseWindow
    ref="window"
    :id="id"
    :swatch_color="swatch_color"
    :title="title"
    :width="window_width"
    :height="window_height"
    :pos="window_position"
    :swatch_title="swatch_title"
    :isHidden="is_hidden"
    @onClosed="onClosed"
    @onMoved="onMoved"
    @onResized="onResized"
    @onWindowFocused="onWindowFocused"
    @onShowHideToggle="onShowHideToggle"
    :zIndex="z_index"
    :aspectRatio="aspect_ratio"
  >
  <template v-slot:titlebarButtons>
  <!-- Show snapshot button when not hidden -->
  <BButton
    v-if="!is_hidden"
    @click="onSnapshotClicked"
    title="Take snapshot"
    class="titlebar-button"
    variant="link"
  >
    <i class="bi bi-camera-fill" aria-hidden="true"></i>
  </BButton>

  <!-- Disabled snapshot button when hidden -->
  <BButton
    v-else
    :disabled="true"
    title="Snapshot disabled while contents are hidden"
    class="titlebar-button"
    variant="link"
  >
    <i class="bi bi-camera-fill" aria-hidden="true"></i>
  </BButton>

  <!-- Adjust settings button -->
  <BButton
    @click="onSettingsClicked"
    title="Adjust settings"
    class="titlebar-button"
    variant="link"
  >
    <i class="bi bi-gear-fill" aria-hidden="true"></i>
  </BButton>
</template>

    <BOverlay :show="is_loading" no-fade class="overlay-container">
      <component ref="body" :id="id" :is="spec.component_type" />
    </BOverlay>

    <BModal
      :title="settings_title"
      v-model="show_settings_modal"
      header-close-class = "light"
      header-bg-variant="dark"
      header-text-variant="light"
      body-bg-variant="light"
      body-text-variant="dark"
      no-footer 
    >
      <BTabs>
        <BTab title="Layout">
          <LayoutSettings :id="id" />
        </BTab>
        <BTab title="Data">
          <DataSettings :id="id" />
        </BTab>
        <BTab title="Component">
          <component v-if="spec.settings_type" ref="modal_component" :id="id" :is="spec.settings_type" />
          <p v-else class="no-settings text-muted">No settings available for this component</p>
        </BTab>
        <BTab title="Snapshots" :disabled="is_hidden">
          <SnapshotSettings :id="id" />
        </BTab>
      </BTabs>
    </BModal>
  </BaseWindow>
</template>

<script lang="ts">
import { ref, computed, defineComponent, onMounted, onUnmounted,nextTick } from "vue";
import { useStore } from "vuex";
import BaseWindow from "@render/components/Core/Window/BaseWindow.vue";
//import  { ensureDefaults } from "../SnapshotHelper";
import TitlebarButton from "@render/components/Core/Window/Titlebar/TitlebarButton.vue";
import WindowManager from "@render/components/Core/Window/WindowManager";
import { Position, Size } from "@render/store/datawindow.types";
import { useWindowMixin } from "@render/components/Core/Window/WindowMixin";

function clamp(value: number, min = Number.MIN_VALUE, max = Number.MAX_VALUE) {
  return Math.min(Math.max(value, min), max);
}

export default defineComponent({
  components: {
    BaseWindow,
    TitlebarButton,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props) {
  const store = useStore();
  const show_settings_modal = ref(false);
  const component_loading = ref(0);
  const bodyRef = ref<HTMLElement | null>(null);
  const {title,dataview,layout } = useWindowMixin(props.id);
  const spec = computed(() => store.getters[`${props.id}/spec`]);
  console.log(spec.value)
  const settings_title = computed(() => `${title.value} Settings`);
  const swatch_color = computed(() => dataview.value.color);
  const is_loading = computed(() => component_loading.value > 0 || dataview.value.loading);
  const swatch_title = computed(() => `Using ${dataview.value.name}`);
  const z_index = computed(() => store.getters[`${props.id}/zIndex`]);
  const aspect_ratio = computed(() => store.getters[`${props.id}/aspectRatio`]||1);
  const window_width = computed(() => layout.value.width);
  const window_height = computed(() => layout.value.height);
  const window_position = computed(() => layout.value.position);
  const is_hidden = computed(() => store.getters[`${props.id}/isHidden`]);

  const onResized = (event: any) => {
    const size: Size = { width: event.width, height: event.height };
    store.commit(`${props.id}/updateComponentLayout`, {
      id: props.id,
      width: size.width,
      height: size.height,
    });
  };

  const onSettingsClicked = () => {
    show_settings_modal.value = true;
  };
  const onSnapshotClicked = (event:any) => {
    snapshotContent(event);
  }
  const onMoved = (event: any) => {
    const position: Position = { x: event.x, y: clamp(event.y, 0) };
    store.commit(`${props.id}/updateComponentLayout`, {
      id: props.id,
      position_x: position.x,
      position_y: position.y,
    });
  };

  const onClosed = (event: any) => {
    store.dispatch("datawindows/removeWindow", props.id);
  };

  const onWindowFocused = () => {
    const maxZ = store.getters["datawindows/windowsMaxZIndex"] + 1;
    store.commit(`${props.id}/updateZIndex`, { z_index: maxZ });
  };

  const onShowHideToggle = (event: any) => {
    store.commit(`${props.id}/toggleWindowShowHide`, {
      id: props.id,
      isHidden: event.isHidden,
    });
  };
  const snapshotContent = async (event: MouseEvent) => {
      if (bodyRef.value) {
        //await Snapshot(bodyRef.value, title.value, dataview.value.snapshot);
      }
    };

  onMounted(() => {
    if (bodyRef.value) {
      WindowManager.addWindow(props.id, bodyRef.value);
      // Ensure defaults
      nextTick(() => {
          //ensureDefaults(bodyRef.value, {});
        });

      bodyRef.value.addEventListener("start-loading", () => {
        component_loading.value++;
      });

      bodyRef.value.addEventListener("finish-loading", () => {
        component_loading.value = clamp(component_loading.value - 1, 0);
      });
    }
  });

  onUnmounted(() => {
    WindowManager.removeWindow(props.id);
  });

  return {
    show_settings_modal,
    component_loading,
    bodyRef,
    title,
    spec,
    dataview,
    settings_title,
    swatch_color,
    is_loading,
    swatch_title,
    z_index,
    aspect_ratio,
    window_width,
    window_height,
    window_position,
    is_hidden,
    onResized,
    onSettingsClicked,
    onSnapshotClicked,
    onMoved,
    onClosed,
    onWindowFocused,
    onShowHideToggle,
  };
}

});
</script>

<style scoped>
.titlebar-button {
  padding: 0.01rem; 
  font-size: 1.2rem; /* Adjust icon size */
  margin: 0 0.2rem; /* Reduce horizontal spacing between buttons */
  color: #495057;
}

.titlebar-button:hover {
  color: #0056b3;
}
.overlay-container {
  width: inherit;
  height: inherit;
}
.BModal .header-close-label{
  color: white;
}
</style>
