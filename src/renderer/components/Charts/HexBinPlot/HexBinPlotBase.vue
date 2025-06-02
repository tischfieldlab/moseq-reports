<script lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { hexbin } from 'd3-hexbin';
import { scaleLinear, scaleSequential } from 'd3-scale';
import { GetScale } from '@render/components/Charts/Colors/D3ColorProvider';
import gridLayout from '@render/components/Charts/D3Layout';
import { Observation, HexBin, HexBinWorkerAPI } from "./HexBinPlot.types"
import { wrap } from "comlink";
import HexBinWorker from './Worker?worker'

export const HexBinPlotBasePropsDefaults = {
    resolution: 10,
    useGroups: false,
    colorscale: 'interpolateBuPu',
    title: 'title',
    legendTitle: 'title',
    noDataMessage: 'Sorry, no data available!',
};

export interface HexBinPlotBaseProps {
    data: { x: number; y: number; id: string; group: string }[],
    width: number,
    height: number,
    resolution: number,
    useGroups: boolean,
    colorscale: string,
    groupLabels: string[],
    title: string,
    legendTitle: string,
    noDataMessage?: string
};

export function useHexBinPlotBase(props: HexBinPlotBaseProps) {
    const worker = wrap<HexBinWorkerAPI>(new HexBinWorker());

    const margin = ref({ top: 20, right: 20, bottom: 70, left: 20 });
    const binned = ref<Record<string, any[]>>({});
    const zmax = ref(0);
    const domainX = ref<[number, number]>([0, 0]);
    const domainY = ref<[number, number]>([0, 0]);

    const innerSize = computed(() => ({
        w: props.width - margin.value.left - margin.value.right,
        h: props.height - margin.value.top - margin.value.bottom,
    }));

    const hasData = computed(() => {
        return props.data?.length > 0 && (!props.useGroups || props.groupLabels.length > 0);
    });

    const colormap = computed(() => GetScale(props.colorscale));

    const hexWidth = computed(() => props.resolution * 2 * Math.sin(Math.PI / 3));
    const hexHeight = computed(() => props.resolution * (3 / 2));

    const layout = computed(() => {
        const gl = gridLayout()
            .size([innerSize.value.w, innerSize.value.h])
            .padding([0.3, 0.5])
            .aspect(1.0)(props.useGroups ? props.groupLabels : ["Overall"]);
        return gl;
    });

    const scale = computed(() => {
        const gl = layout.value;
        const xMax = gl.length > 0 ? gl[0].pos.width : 20;
        const x = scaleLinear().domain(domainX.value).range([0, xMax - 20]);
        const yMax = gl.length > 0 ? gl[0].pos.height : 20;
        const y = scaleLinear().domain(domainY.value).range([yMax - 20, 0]);
        const c = scaleSequential(colormap.value).domain([0, zmax.value]);
        return { x, y, c, gl };
    });

    const hexbing = computed(() =>
        hexbin<Observation>()
            .x(d => scale.value.x(d.x))
            .y(d => scale.value.y(d.y))
            .radius(props.resolution)
            .size([scale.value.x.range()[1], scale.value.y.range()[0]])
    );

    const prepareData = async (newData: Observation[]) => {
        if (!newData) return;

        const result = await worker.binData(
            JSON.parse(JSON.stringify(newData)), // to ensure transferable
            props.useGroups ? props.groupLabels : null,
            scale.value.x.range()[1],
            props.resolution
        );

        binned.value = result.binned;
        zmax.value = result.zmax;
        domainX.value = result.domainX;
        domainY.value = result.domainY;
    };


    watch(() => props.data, (newData) => {
        if (newData) prepareData(newData);
    }, { immediate: true });



    return {
        margin,
        zmax,
        binned,
        domainX,
        domainY,
        innerSize,
        colormap,
        layout,
        scale,
        hasData,
        hexbing,
        hexWidth,
        hexHeight,
        prepareData
    };
}
</script>

<style scoped>
g.group {
    border: 1px solid #666;
}

text.label,
text.title {
    text-anchor: middle;
}
</style>
