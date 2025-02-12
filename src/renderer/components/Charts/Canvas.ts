import { defineComponent, ref, provide, onMounted, Directive } from "vue";

export function getScaledContext2d(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
) {
  const ctx = canvas.getContext("2d");
  console.log("canvas mixing accessed")
  if (ctx !== null) {
    // Set display size (css pixels).
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Set actual size in memory (scaled to account for extra pixel density).
    const scale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
    canvas.width = Math.floor(width * scale);
    canvas.height = Math.floor(height * scale);

    // Normalize coordinate system to use css pixels.
    ctx.scale(scale, scale);
  }
  return ctx;
}

// Vue 3 Canvas Mixin
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

    const debouncedDraw = () => {
      /** Debounced drawing logic **/
      console.log("debouncedDraw")
    };

    const debouncedHover = (event: MouseEvent) => {
      /** Debounced hover logic **/
      console.log("debouncedHover")
    };

    // Provide the canvas context to child components
    provide("canvas", canvas);

    return {
      canvas,
      debouncedDraw,
      debouncedHover,
    };
  },
});

// Vue 3 Directive for DPI Adaptation
const dpiAdapt: Directive = {
  mounted(el, binding) {
    const canvas = el as HTMLCanvasElement;
    const { width, height } = binding.value;
    
    const scale = window.devicePixelRatio || 1;
    const cssWidth = `${width}px`;
    const cssHeight = `${height}px`;
    const cnvWidth = Math.floor(width * scale);
    const cnvHeight = Math.floor(height * scale);
    console.log(scale,cssWidth)
    // Set display size (CSS pixels)
    canvas.style.width = cssWidth;
    canvas.style.height = cssHeight;

    // Set actual size in memory (scaled to account for extra pixel density)
    canvas.width = cnvWidth;
    canvas.height = cnvHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.resetTransform();
      ctx.scale(scale, scale);
    }
  },
};

// Main Component Integration
export default {
  mixins: [CanvasMixin],
  directives: {
    dpiAdapt,
  },
 template: `
    <b-card>
      <canvas
        v-dpiAdapt="{ width: 300, height: 150 }"
        ref="canvasRef"
        style="border: 1px solid #ccc;"
        ></canvas>
    </b-card>
  `,
};
