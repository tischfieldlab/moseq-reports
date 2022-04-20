import Vue from "vue";

export function getScaledContext2d(
    canvas: HTMLCanvasElement,
    width: number,
    height: number
) {
    const ctx = canvas.getContext("2d");

    if (ctx !== null) {
        // Set display size (css pixels).
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";

        // Set actual size in memory (scaled to account for extra pixel density).
        const scale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
        canvas.width = Math.floor(width * scale);
        canvas.height = Math.floor(height * scale);

        // Normalize coordinate system to use css pixels.
        ctx.scale(scale, scale);
    }
    return ctx;
}

const CanvasMixin = Vue.extend({
    provide(): { canvas: { cxt: CanvasRenderingContext2D | null } } {
        return {
            canvas: this.canvas,
        };
    },
    data() {
        return {
            debouncedDraw: () => {
                /**/
            },
            debouncedHover: (event: MouseEvent) => {
                /**/
            },
            canvas: {
                // This is the CanvasRenderingContext that children will draw to.
                cxt: null as CanvasRenderingContext2D | null,
                scale: window.devicePixelRatio || 1,
            },
        };
    },
    directives: {
        dpiadapt(el, binding, vnode) {
            const that = vnode.context as any;
            const c = el as HTMLCanvasElement;
            that.canvas.cxt = c.getContext("2d");
            that.canvas.scale = window.devicePixelRatio || 1;

            const cssWidth = binding.value.width + "px";
            const cssHeight = binding.value.height + "px";
            const cnvWidth = Math.floor(
                binding.value.width * that.canvas.scale
            );
            const cnvHeight = Math.floor(
                binding.value.height * that.canvas.scale
            );

            // Set display size (css pixels).
            if (c.style.width !== cssWidth || c.style.height !== cssHeight) {
                c.style.width = cssWidth;
                c.style.height = cssHeight;
            }

            // Set actual size in memory (scaled to account for extra pixel density).
            if (c.width !== cnvWidth || c.height !== cnvHeight) {
                c.width = cnvWidth;
                c.height = cnvHeight;
            }

            if (that.canvas.cxt !== null) {
                that.canvas.cxt.resetTransform();
                that.canvas.cxt.scale(that.canvas.scale, that.canvas.scale);
            }
        },
    },
});
export default CanvasMixin;
