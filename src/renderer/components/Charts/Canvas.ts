import { defineComponent, ref, provide, onMounted, nextTick, Directive } from "vue";
import { throttle } from "@render/util/Events";

export function getScaledContext2d(canvas: HTMLCanvasElement, width: number, height: number) {
  const ctx = canvas.getContext("2d");

  if (ctx !== null) {
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const scale = window.devicePixelRatio;
    canvas.width = Math.floor(width * scale);
    canvas.height = Math.floor(height * scale);
    ctx.scale(scale, scale);
  }
  return ctx;
}

const CanvasMixin = defineComponent({
  name: "CanvasMixin",
  setup() {
    const canvas = ref<{
      cxt: CanvasRenderingContext2D | null;
      scale: number;
    }>({
      cxt: null,
      scale: window.devicePixelRatio || 1,
    });

    const tooltipPosition = ref<{ x: number; y: number } | undefined>(undefined);
    const hoverItem = ref<any>(undefined);
    const labelStats = ref<{ count: number; total: number; longest: number }>({ count: 0, total: 0, longest: 0 });
    const handleHover = (event: MouseEvent) => {
      if (!event?.target) return;
      const target = event.target as HTMLElement;

      if (target.dataset.identifier) {
        tooltipPosition.value = { x: event.clientX, y: event.clientY };
        hoverItem.value = findPointById(target.dataset.identifier);
      } else if (target.dataset.group) {
        tooltipPosition.value = { x: event.clientX, y: event.clientY };
        hoverItem.value = findGroupById(target.dataset.group);
      } else {
        tooltipPosition.value = undefined;
        hoverItem.value = undefined;
      }
    };

    const debouncedHover = throttle(handleHover, 10);
    const computeLabelStats = (labels: string[]) => {
      nextTick(() => {
        const canvasElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
        document.body.appendChild(canvasElement);

        const widths = labels.map((label) => {
          canvasElement.textContent = label;
          return canvasElement.getBBox().width;
        });

        document.body.removeChild(canvasElement);

        labelStats.value = {
          count: labels.length,
          total: widths.reduce((sum, w) => sum + w, 0),
          longest: Math.max(...widths),
        };
      });
    };

    const findPointById = (id: string) => {
      console.log("Finding point by ID", id);
      return { id, type: "point" }; 
    };

    const findGroupById = (id: string) => {
      console.log("Finding group by ID", id);
      return { id, type: "group" };
    };

    provide("canvas", canvas);
    provide("tooltipPosition", tooltipPosition);
    provide("hoverItem", hoverItem);

    return {
      canvas,
      tooltipPosition,
      hoverItem,
      labelStats,
      computeLabelStats,
      debouncedHover,
    };
  },
});

const dpiAdapt: Directive = {
  mounted(el, binding) {
    const canvas = el as HTMLCanvasElement;
    const { width, height } = binding.value;

    const scale = window.devicePixelRatio || 1;
    const cssWidth = `${width}px`;
    const cssHeight = `${height}px`;
    const cnvWidth = Math.floor(width * scale);
    const cnvHeight = Math.floor(height * scale);

    canvas.style.width = cssWidth;
    canvas.style.height = cssHeight;
    canvas.width = cnvWidth;
    canvas.height = cnvHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.resetTransform();
      ctx.scale(scale, scale);
    }
  },
};

export default {
  mixins: [CanvasMixin],
  directives: {
    dpiAdapt,
  },
  template: `
    <BCard>
      <canvas
        v-dpiAdapt="{ width: 300, height: 150 }"
        ref="canvasRef"
        style="border: 1px solid #ccc;"
        @mousemove="debouncedHover"
        @mouseleave="hoverItem = undefined"
      ></canvas>
    </BCard>
  `,
};
