<template>

</template>


<script setup lang="ts">
import { defineComponent, computed, inject, h } from "vue";
import { scaleLinear } from "d3-scale";
import ColorScaleLegendBase, { Orientation } from "./ColorScaleLegendBase";

interface CanvasColorScaleLegendProps extends ColorScaleLegendProps {
    x: number;
    y: number;
}
const CanvasColorScaleLegendPropsDefaults = {
    ...ColorScaleLegendPropsDefaults,
    x: 0,
    y: 0,
};


const props = withDefaults(defineProps<CanvasColorScaleLegendProps>(), CanvasColorScaleLegendPropsDefaults);
const {axis_translate, isHorizontal label_translate, linearscale, offsets, stops} = useColorScaleLegendBase(props);

const canvas = inject("canvas") as CanvasContext;


function calcNumTicks(cxt: CanvasRenderingContext2D) {
    const tickFormat = linearscale.value.tickFormat(undefined, props.tickformat);
    const tickMeasurements = linearscale.value
        .ticks(undefined)
        .map((t) => cxt.measureText(tickFormat(t)));

    const maxWidth = Math.max(...tickMeasurements.map((n) => n.width));
    const maxHeight = parseInt(cxt.font.match(/\d+/) as unknown as string, 10);

    let numTicks = isHorizontal.value
        ? props.width / (maxWidth * 2)
        : props.height / maxHeight;

    return Math.max(props.minticks, Math.min(numTicks, props.maxticks));
};


function renderCanvas() {
    if (!canvas || !canvas.cxt) {
        console.warn("No canvas context received");
        return;
    }
    if (!props.scale) {
        console.warn("No scale received");
        return;
    }

    const cxt = canvas.cxt;
    cxt.save();
    cxt.translate(props.x - props.width / 2, props.y);
    cxt.clearRect(-20, 0, props.width + 30, props.height + 50);
    let grad = isHorizontal.value
        ? cxt.createLinearGradient(0, 0, props.width, 0)
        : cxt.createLinearGradient(0, props.height, 0, 0);

    if (!props.scale.domain().includes(NaN)) {
        for (const d of linearscale.value.ticks(20)) {
            grad.addColorStop(linearscale.value(d) / 100, props.scale(d));
        }
    }

    cxt.fillStyle = grad;
    cxt.fillRect(0, 0, props.width, props.height);
    const numTicks = calcNumTicks(cxt);
    const tickFormat = linearscale.value.tickFormat(numTicks, props.tickformat);
    cxt.fillStyle = "#888";
    cxt.strokeStyle = "#888";

    if (isHorizontal.value) {
        const tickOffset = props.width / 2;
        cxt.textAlign = "center";
        cxt.textBaseline = "top";

        linearscale.value.ticks(numTicks).forEach((d) => {
            cxt.beginPath();
            cxt.moveTo(tickOffset + linearscale.value(d), props.height);
            cxt.lineTo(tickOffset + linearscale.value(d), props.height + 6);
            cxt.stroke();

            cxt.fillText(tickFormat(d), tickOffset + linearscale.value(d), props.height + 6);
        });
    } else {
        const tickOffsetX = props.width;
        const tickOffsetY = props.height / 2;
        cxt.textAlign = "left";
        cxt.textBaseline = "middle";

        linearscale.value.ticks(numTicks).forEach((d) => {
            cxt.beginPath();
            cxt.moveTo(tickOffsetX, tickOffsetY + linearscale.value(d));
            cxt.lineTo(tickOffsetX + 6, tickOffsetY + linearscale.value(d));
            cxt.stroke();

            cxt.fillText(tickFormat(d), tickOffsetX + 12, tickOffsetY + linearscale.value(d));
        });
    }

    cxt.font = "13px Verdana";
    cxt.fillStyle = "#888";

    if (isHorizontal.value) {
        cxt.textAlign = "center";
        cxt.fillText(props.title, props.width / 2, props.height + 30);
    } else {
        cxt.rotate(-90 * Math.PI / 180);
        cxt.textAlign = "center";
        cxt.fillText(props.title, -props.height / 2, props.width + 40);
    }

    cxt.restore();
};
const vCbarAxis: Directive = {
    mounted: renderCanvas,
    updated: renderCanvas,
}
</script>
