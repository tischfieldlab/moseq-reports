<template>
  <div
    :id="id"
    class="msqWindow"
    :style="{
      left: `${window_xpos}px`,
      top: `${window_ypos}px`,
      width: `${window_width}px`,
      height: `${window_height}px`,
      zIndex: `${zIndex}`,
    }"
    @mousedown="windowClicked"
  >
    <div
      class="msq-window-titlebar noselect"
      data-draggable="msq-titlebar"
      @mousedown="onDragStart"
      @mouseover="onTitlebarHover"
      @mouseleave="onTitlebarLeave"
    >
      <span
        data-draggable="dataview-swatch"
        class="dataview-swatch"
        :id="`${id}-swatch`"
        :style="{ background: swatch_color }"
        
        v-b-tooltip.hover="{ title: swatch_title, delay: { show: 0, hide: 0 } }"
        
      >
      </span>
      <div class="titlebar-button-container">
        <slot name="titlebarButtons"></slot>
  
        <!-- Toggle Button for Show/Hide Contents -->
        <BButton variant="link" :title="isCollapsed ? 'Show contents' : 'Hide contents'" @click="collapseWindow">
          <i :class="isCollapsed ? 'bi bi-caret-up-fill' : 'bi bi-caret-down-fill'"></i>
        </BButton>
  
        <!-- Close Button -->
        <BButton variant="link" :title="'Close window'" @click="onClose">
            <i class="btn-close"></i>
        </BButton>
      </div>

      {{ title }}
    </div>
    <div
      :id="`window-content-${id}`"
      :hidden="isCollapsed"
      class="window-content"
      :style="{
        width: `${contentWidth}px`,
        height: `${contentHeight}px`,
      }"
    >
      <slot></slot>
    </div>
    <div @mousedown="onResizeStart" class="noselect" v-if="!isCollapsed">
      <div data-direction="right" class="resizer resizer-r"></div>
      <div data-direction="left" class="resizer resizer-l"></div>
      <div data-direction="top" class="resizer resizer-t"></div>
      <div data-direction="top-right" class="resizer resizer-tr"></div>
      <div data-direction="top-left" class="resizer resizer-tl"></div>
      <div data-direction="bottom" class="resizer resizer-b"></div>
      <div data-direction="bottom-right" class="resizer resizer-br"></div>
      <div data-direction="bottom-left" class="resizer resizer-bl"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, reactive ,onMounted} from "vue";
import { Position } from "@render/store/datawindow.types";
import TitlebarButton from "@render/components/Core/Window/Titlebar/TitlebarButton.vue";
import CloseButton from "@render/components/Core/Window/Titlebar/CloseButton.vue";
import { applyAspectRatio, isValidHeight, isValidWidth } from "@render/components/Core/Window/util";
enum ResizeType {
  Right = "right",
  Left = "left",
  Top = "top",
  Bottom = "bottom",
  TopRight = "top-right",
  TopLeft = "top-left",
  BottomRight = "bottom-right",
  BottomLeft = "bottom-left",
}

export default defineComponent({
  name: "BaseWindow",
    components: {
      TitlebarButton,
      CloseButton,
    },
  props: {
    id: { type: String, required: true },
    swatch_color: { type: String, required: true },
    title: { type: String, required: true },
    height: { type: Number, required: true },
    width: { type: Number, required: true },
    pos: { type: Object as () => Position, required: true },
    isHidden: { type: Boolean, default: false },
    resizeable: { type: Boolean, default: true },
    minWidth: { type: Number, default: 260 },
    minHeight: { type: Number, default: 155 },
    aspectRatio: { type: Number, default: undefined },
    zIndex: { type: Number, required: false },
    swatch_title: { type: String, required: false },
  },
  setup(props, { emit }) {
  const isCollapsed = ref(props.isHidden);
  const restoredHeight = ref(props.height);
  const titlebarHeight = ref(35);

  const contentWidth = ref(props.width);
  const contentHeight = ref(props.height);
  const windowPos = reactive(props.pos);
  const isDragging = ref(false);
  const prevDeltaX = ref(0);
  const prevDeltaY = ref(0);
  const isResizing = ref(false);
  const resizeElement = ref<HTMLElement | null>(null);

  const window_width = computed(() => contentWidth.value + 2);
  const window_height = computed(() => contentHeight.value + titlebarHeight.value + 2);
  const window_xpos = computed(() => windowPos.x);
  const window_ypos = computed(() => windowPos.y);

  const applyAspect = (newWidth: number, newHeight: number) =>
    applyAspectRatio(newWidth, newHeight, props.aspectRatio);

  const collapseWindow = () => {
    isCollapsed.value = !isCollapsed.value; 
    if (isCollapsed.value) {
      restoredHeight.value = contentHeight.value;
      contentHeight.value = 0;
    } else {
      contentHeight.value = restoredHeight.value;
    }
    emit("onShowHideToggle", { isHidden: isCollapsed.value });
  };

  const onTitlebarHover = () => {
    if (!isDragging.value) document.body.style.cursor = "grab";
  };

  const onTitlebarLeave = () => {
    if (!isDragging.value) document.body.style.cursor = "auto";
  };

  const windowClicked = () => {
    emit("onWindowFocused");
  };
  const onClose = (event: any) => {
  emit("onClosed", event);
};

  const onDragStart = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.dataset.draggable) {
      return;
    }
    prevDeltaX.value = event.clientX;
    prevDeltaY.value = event.clientY;
    isDragging.value = true;

    document.onmousemove = (e: MouseEvent) => {
      if (isDragging.value) {
        const deltaX = e.clientX - prevDeltaX.value;
        const deltaY = e.clientY - prevDeltaY.value;
        prevDeltaX.value = e.clientX;
        prevDeltaY.value = e.clientY;
        windowPos.x += deltaX;
        windowPos.y += deltaY;
      }
    };

    document.onmouseup = () => {
      isDragging.value = false;
      emit("onMoved", { x: windowPos.x, y: windowPos.y });
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };

  const onResizeStart = (event: MouseEvent) => {
    if (!props.resizeable) return;
    resizeElement.value = event.target as HTMLElement;
    prevDeltaX.value = event.clientX;
    prevDeltaY.value = event.clientY;
    isResizing.value = true;

    document.onmousemove = (e: MouseEvent) => {
      if (isResizing.value && !isCollapsed.value) {
        const deltaX = e.clientX - prevDeltaX.value;
        const deltaY = e.clientY - prevDeltaY.value;

        let newHeight = contentHeight.value;
        let newWidth = contentWidth.value;
        let newX = windowPos.x;
        let newY = windowPos.y;

        const resizeType = resizeElement.value?.dataset.direction as ResizeType;

        if (resizeType) {
          // Vertical resize
          if ([ResizeType.Top, ResizeType.TopRight, ResizeType.TopLeft].includes(resizeType)) {
            newHeight -= deltaY;
            newY += deltaY;
          } else if ([ResizeType.Bottom, ResizeType.BottomRight, ResizeType.BottomLeft].includes(resizeType)) {
            newHeight += deltaY;
          }

          // Horizontal resize
          if ([ResizeType.Right, ResizeType.TopRight, ResizeType.BottomRight].includes(resizeType)) {
            newWidth += deltaX;
          } else if ([ResizeType.Left, ResizeType.TopLeft, ResizeType.BottomLeft].includes(resizeType)) {
            newWidth -= deltaX;
            newX += deltaX;
          }
        }

        const adjusted = applyAspect(newWidth, newHeight);
        contentWidth.value = isValidWidth(adjusted.width, props.minWidth) ? adjusted.width : contentWidth.value;
        contentHeight.value = isValidHeight(adjusted.height, props.minHeight) ? adjusted.height : contentHeight.value;
        windowPos.x = newX;
        windowPos.y = newY;

        prevDeltaX.value = e.clientX;
        prevDeltaY.value = e.clientY;
      }
    };

    document.onmouseup = () => {
      isResizing.value = false;
      resizeElement.value = null;
      emit("onResized", { width: contentWidth.value, height: contentHeight.value });
      emit("onMoved", { x: windowPos.x, y: windowPos.y });
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };

  watch(
    () => props.aspectRatio,
    (newValue) => {
      if (newValue) {
        const adjusted = applyAspect(contentWidth.value, contentHeight.value);
        contentWidth.value = adjusted.width;
        contentHeight.value = adjusted.height;
        emit("onResized", { width: contentWidth.value, height: contentHeight.value });
      }
    }
  );

  return {
    isCollapsed,
    contentWidth,
    contentHeight,
    window_width,
    window_height,
    window_xpos,
    window_ypos,
    collapseWindow,
    onDragStart,
    onResizeStart,
    onTitlebarHover,
    onTitlebarLeave,
    windowClicked,
    onClose,
  };
  },
});
</script>

<style scoped>
.titlebar-button-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.titlebar-button-container .btn-link {
  padding: 0.01rem;
  color: #495057;
  font-size: 1.2rem;
  margin: 0 0.2rem;
}
.titlebar-button-container .btn-link:hover {
  color: #0056b3;
}
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
  cursor: nwse-resize;
  height: 5px;
  right: 0;
  width: 5px;
}

.resizer-bl {
  bottom: 0;
  cursor: nesw-resize;
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
  cursor: nwse-resize;
  height: 5px;
  left: 0;
  width: 5px;
}

.resizer-tr {
  top: 0;
  cursor: nesw-resize;
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

.window-content {
  position: relative;
}

.titlebar-button-container {
  position: absolute;
  margin-top: -27px;
  right: 8px;
}

.noselect {
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
}
</style>
