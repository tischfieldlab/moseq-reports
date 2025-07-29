<template>
    <div>
        <canvas
            ref="canvasEl"
            v-dpi-adapt="{ width: props.width, height: props.height }"
            v-show="hasData"
        ></canvas>
        <ColorScaleLegend
            ref="legend"
            :title="props.legendTitle"
            :scale="scale.c"
            :width="200"
            :height="10"
            :x="props.width / 2"
            :y="innerSize.h + 20"
        />
        <MessageBox :show="!hasData">
            {{ props.noDataMessage }}
        </MessageBox>
    </div>
</template>

<script setup lang="ts">
import { onMounted, watchPostEffect, useTemplateRef } from "vue";
import ColorScaleLegend from "@render/components/Charts/Colors/ColorScaleLegendCanvas.vue";
import MessageBox from "@render/components/Charts/CenteredMessage.vue";
import { useCanvas } from '@render/components/Charts/Canvas';
import { useHexBinPlotBase } from "./HexBinPlotBase";
import { HexBinPlotBaseProps, HexBinPlotBasePropsDefaults } from "./HexBinPlot.types";


const props = withDefaults(defineProps<HexBinPlotBaseProps>(), HexBinPlotBasePropsDefaults);
const {
    margin,
    binned,
    innerSize,
    scale,
    hexbing,
    hasData,
} = useHexBinPlotBase(props);

const { canvas, vDpiAdapt } = useCanvas();
const legend = useTemplateRef("legend");

const getLabelFontSize = (
    ctx: CanvasRenderingContext2D,
    maxWidth: number,
    labels: string[],
    fontFace: string
): number => {
    const widest = labels.reduce((prev, curr) =>
        ctx.measureText(curr).width > ctx.measureText(prev).width ? curr : prev
    );

    ctx.save();
    let size = 300;
    do {
        size--;
        ctx.font = `${size}px ${fontFace}`;
    } while (ctx.measureText(widest).width > maxWidth);
    ctx.restore();
    return size;
};

function draw() {
    const ctx = canvas.value.cxt;
    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, props.width, props.height);

    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "black";
    ctx.font = "13px Verdana";
    ctx.fillText(props.title, props.width / 2, 20);

    ctx.translate(margin.value.left, margin.value.top);

    let fontSize = getLabelFontSize(
        ctx,
        scale.value.gl[0]?.pos.width || 100,
        scale.value.gl.map((cell) => cell.data),
        "Verdana"
    );
    if (fontSize > 13) fontSize = 13;

    for (const cell of scale.value.gl) {
        ctx.save();
        ctx.translate(cell.pos.x, cell.pos.y);
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = "black";
        ctx.font = `${fontSize}px Verdana`;
        ctx.fillText(cell.data, cell.pos.width / 2, 0);

        const hexData = binned.value[cell.data];
        if (hexData) {
            for (const h of hexData) {
                ctx.save();
                ctx.translate(h.x + cell.pos.paddingX / 2, h.y + 20);
                ctx.beginPath();
                ctx.strokeStyle = "rgba(0,0,0,0.1)";
                ctx.lineWidth = 0;
                ctx.fillStyle = scale.value.c(h.z);
                const p = new Path2D(hexbing.value.hexagon());
                ctx.stroke(p);
                ctx.fill(p);
                ctx.restore();
            }
        }
        ctx.restore();
    }
    ctx.restore();

    if (legend.value) {
        legend.value.renderCanvas();
    }
};


onMounted(() => {
    watchPostEffect(draw);
});

</script>

<style scoped>
canvas {
    display: block;
}
</style>
