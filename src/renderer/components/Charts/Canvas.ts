import { defineComponent, ref, provide, onMounted, nextTick, Directive, shallowRef } from "vue";
import { throttle } from "@render/util/Events";



export interface CanvasContext {
    cxt: CanvasRenderingContext2D | null;
    scale: number;
}

export function useCanvas() {
    const canvas = shallowRef<CanvasContext>({
        cxt: null,
        scale: window.devicePixelRatio || 1,
    });
    provide("canvas", canvas);

    const last_width = ref(0);
    const last_height = ref(0);

    function getScaledContext2d(canvas: HTMLCanvasElement, width: number, height: number) {
        const ctx = canvas.getContext("2d");
        const scale = window.devicePixelRatio || 1;

        if (ctx !== null) {
            // Set display size (css pixels).
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            // Set actual size in memory (scaled to account for extra pixel density).
            canvas.width = Math.floor(width * scale);
            canvas.height = Math.floor(height * scale);

            // Scale the context to ensure correct rendering.
            ctx.resetTransform();
            ctx.scale(scale, scale);
        }
        return {ctx, scale};
    }

    function run(el, binding){
        const canvas_el = el as HTMLCanvasElement;
        const { width, height } = binding.value;

        if (width === last_width.value && height === last_height.value) {
            return;
        }

        last_width.value = width;
        last_height.value = height;

        const {ctx, scale} = getScaledContext2d(canvas_el, width, height);

        // important: set the ref context and scale
        canvas.value.cxt = ctx;
        canvas.value.scale = scale;
    }

    const vDpiAdapt: Directive = {
        beforeUpdate: run,
        mounted: run,
    };

    return {
        canvas,
        vDpiAdapt,
        getScaledContext2d
    };
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


/*
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
};*/
