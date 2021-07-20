import { expose } from 'threads/worker';
import { hexbin } from 'd3-hexbin';
import { groupby } from '@/util/Array';
import { scaleLinear } from 'd3-scale';
import { extent } from 'd3-array';

interface Observation {
    x: number;
    y: number;
    id: string;
    group: string;
}


const exposedMethods = {
    binData(data: Array<Observation>, groupLabels: Array<string>|null, width: number, resolution: number) {
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

        let groupedData: {[group: string]: Array<Observation>};
        if (groupLabels === null) {
            groupedData = groupby(data, (p: any) => 'Overall', ['Overall']);
        } else {
            groupedData = groupby(data, (p: any) => p.group, groupLabels);
        }
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
