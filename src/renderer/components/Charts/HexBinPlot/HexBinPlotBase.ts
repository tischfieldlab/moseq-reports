import { ref, computed, onUnmounted, toRaw, watchEffect } from 'vue';
import { hexbin } from 'd3-hexbin';
import { scaleLinear, scaleSequential } from 'd3-scale';
import { GetScale } from '@render/components/Charts/Colors/D3ColorProvider';
import gridLayout from '@render/components/Charts/D3Layout';
import { releaseProxy } from 'comlink';
import { HexBinPlotBaseProps, Observation } from './HexBinPlot.types';



export function useHexBinPlotBase(props: HexBinPlotBaseProps) {
    const worker = new ComlinkWorker<typeof import('./Worker')>(
        new URL('./Worker', import.meta.url),
        {}
    );

    const margin = ref({ top: 20, right: 20, bottom: 70, left: 20 });
    const binned = ref<Record<string, any[]>>({});
    const zmax = ref(0);
    const domainX = ref<number[]>([0, 0]);
    const domainY = ref<number[]>([0, 0]);

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
            .aspect(1.0)(props.useGroups ? props.groupLabels : ['Overall']);
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
            .x((d) => scale.value.x(d.x))
            .y((d) => scale.value.y(d.y))
            .radius(props.resolution)
            .size([scale.value.x.range()[1], scale.value.y.range()[0]])
    );

    watchEffect(async () => {
        try {
            const result = await worker.binData(
                toRaw(props.data),
                props.useGroups ? props.groupLabels : null,
                scale.value.x.range()[1],
                props.resolution,
            );
            binned.value = result.binned;
            zmax.value = result.zmax;
            domainX.value = result.domainX;
            domainY.value = result.domainY;
        } catch (error) {
            console.error('Error preparing data:', error);
        }
    });


    onUnmounted(() => {
        worker[releaseProxy]();
    });

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
    };
}
