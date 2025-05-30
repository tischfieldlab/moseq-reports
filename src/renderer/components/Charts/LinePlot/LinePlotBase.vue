<script lang="ts">
import { scaleLinear, scalePoint, scaleOrdinal } from 'd3-scale';
import { line, Line } from 'd3-shape';
import { extent } from 'd3-array';
import { ref, reactive, computed } from 'vue';


function default_tooltip_formatter(value: any) {
    return JSON.stringify(value, undefined, '\t');
}

export interface LinePlotBaseProps {
    data: object[];
    seriesKey: string;
    varKey: string;
    valueKey: string;
    errorKey: string;
    showError: boolean;
    varOrdering: any[];
    width: number;
    height: number;
    showPoints?: boolean;
    pointSize?: number;
    showLines?: boolean;
    lineWeight?: number;
    xAxisTitle?: string;
    yAxisTitle?: string;
    seriesLabels: string[];
    seriesColors: string[];
    tooltipFormatter: (item: any) => string;
    hoverCursor?: string;
}

export const LinePlotBasePropsDefaults = {
    showError: true,
    varOrdering: () => [],
    showPoints: true,
    pointSize: 3,
    showLines: true,
    lineWeight: 3,
    xAxisTitle: 'Variable',
    yAxisTitle: 'Value',
    seriesLabels: () => [],
    seriesColors: () => [],
    tooltipFormatter: default_tooltip_formatter,
    hoverCursor: 'pointer',
}

export interface LinePlotBaseEmits {
    //(e: 'row-order-changed', row_order: any[]): void
    //(e: 'col-order-changed', col_order: any[]): void
    (e: 'lineplot-click', data: {e: Event, series: string, var: string, value: string}): void
}

export function useLinePlotBase(props: LinePlotBaseProps) {
    const margin = reactive({
        top: 20,
        right: 20,
        bottom: 50,
        left: 60,
    });
    const xAxisLabelYPos = ref(45);
    const watchers = ref<Array<(() => void)>>([]);
    const rotate_labels = ref(false);
    const label_stats = ref({count: 0, total: 0, longest: 0});
    const tooltipPosition = ref<{x: number, y:number}|undefined>(undefined);
    const hoverItem = ref<object|undefined>(undefined);

    const origin = computed((): any => {
        const x = margin.left;
        const y = innerHeight.value + margin.top;
        return { x, y };
    });
    const innerWidth = computed((): number => {
        const width = props.width - margin.left - margin.right;
        rotate_labels.value = label_stats.value.longest > width / label_stats.value.count;
        if (rotate_labels) {
            const rotatedHeight = Math.cos(45 * (Math.PI / 180)) * label_stats.value.longest;
            xAxisLabelYPos.value = rotatedHeight + 20;
        } else {
            xAxisLabelYPos.value = 45;
        }
        margin.bottom = xAxisLabelYPos.value + 20;
        return width;
    });
    const innerHeight = computed((): number =>{
        return props.height - margin.top - margin.bottom;
    });
    const has_data = computed((): boolean => {
        return props.data !== undefined && props.data !== null && props.data.length > 0;
    });
    const seriesPath = computed((): Line<{}> =>{
        return line<{}>()
            .defined((d) => isPointValid(d))
            .x((d) => scale.value.x(d[props.varKey]))
            .y((d) => scale.value.y(d[props.valueKey]))
    });
    const groupedData = computed((): {[series: string]: {}[] } => {
        const series = [...new Set(props.data.map(d => d[props.seriesKey]))];
        const kludges = props.varOrdering.filter((d) => Number.parseInt(d, 10) < 0);
        const grouped = Object.fromEntries(series.map((seriesValue) => {
            return [
                seriesValue,
                props.data
                    .filter((d) => d[props.seriesKey] === seriesValue)
                    .concat(kludges.map((k) => {
                        return {
                            [props.seriesKey]: seriesValue,
                            [props.varKey]: k,
                            [props.valueKey]: undefined,
                        }
                    }))
                    .sort((a, b) => props.varOrdering.indexOf(a[props.varKey]) - props.varOrdering.indexOf(b[props.varKey])),
            ];
        }));

        return grouped;
    });
    const dataVars = computed((): any[] => {
        return [...new Set(props.data.map(d => d[props.varKey]))]
    });
    const scale = computed((): any => {
        if (!has_data.value) {
            return { x: scalePoint(), y: scaleLinear(), c: scaleOrdinal() };
        }
        const x = scalePoint()
            .domain(props.varOrdering as string[])
            .range([0, innerWidth.value])
            .padding(0.5);

        let ext = [0, 0];
        if (props.data !== null) {
            ext = extent(props.data.flatMap((n) => {
                return [
                    n[props.valueKey],
                    n[props.valueKey] + (props.errorKey? n[props.errorKey] : 0),
                    n[props.valueKey] - (props.errorKey? n[props.errorKey] : 0),
                ];
            })) as [number, number];
        }
        const y = scaleLinear()
            .domain(ext as [number, number])
            .range([innerHeight.value, 0]);

        const c = scaleOrdinal()
            .domain(props.seriesLabels as string[])
            .range(props.seriesColors as string[]);

        return { x, y, c };
    });
    const tooltip_text = computed((): string =>{
        if (hoverItem.value !== undefined){
            return props.tooltipFormatter(hoverItem.value);
        }
        return '';
    });

    function isPointValid(d: object) {
        return !Number.isNaN(scale.value.x(d[props.varKey]))
            && !Number.isNaN(scale.value.y(d[props.valueKey]));
    }
    function seriesData(seriesValue) {
        return props.data.filter((d) => d[props.seriesKey] === seriesValue);
    }

    return {
        margin,
        xAxisLabelYPos,
        watchers,
        rotate_labels,
        label_stats,
        tooltipPosition,
        hoverItem,
        origin,
        innerWidth,
        innerHeight,
        has_data,
        seriesPath,
        groupedData,
        dataVars,
        scale,
        tooltip_text,
        isPointValid,
        seriesData
    };

};
</script>