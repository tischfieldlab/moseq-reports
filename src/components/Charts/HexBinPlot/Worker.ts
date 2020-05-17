import { expose } from 'threads/worker';
import { hexbin } from 'd3-hexbin';
import { groupby } from '@/util/Array';
import { scaleLinear, scaleBand, scaleOrdinal, scaleSequential } from 'd3-scale';
import { max, min, mean, quantile, median, sum, extent } from 'd3-array';

interface Observation {
    x: number;
    y: number;
    id: string;
    group: string;
}


const exposedMethods = {
    binData(data: Observation[], groupLabels: string[], width: number, resolution: number) {
        const x = scaleLinear()
            .domain(extent(data, (d: any) => d.x) as [number, number])
            .range([0, width]);

        const y = scaleLinear()
            .domain(extent(data, (d: any) => d.y) as [number, number])
            .range([width, 0]);

        const hexer = hexbin()
            .x((d) => x(d.x))
            .y((d) => y(d.y))
            .radius(resolution)
            .size([width, width]);

        const groupedData = groupby(data, (p: any) => p.group, groupLabels);
        const binned = Object.fromEntries(Object.entries(groupedData)
                            .map(([gl, gvals]) => {
                                const h = hexer(gvals);
                                h.map((sub) => sub.z = sub.length / gvals.length);
                                return [gl, h];
                            }));
        const zmax = Math.max(...Object.values(binned).flatMap((vals) => vals.map((d) => d.z)));

        return {
            binned,
            zmax,
            domainX: x.domain(),
            domainY: y.domain(),
        };
    },
};
expose(exposedMethods);
export type HexbinWorker = typeof exposedMethods;
