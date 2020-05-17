import { expose } from 'threads/worker';
import { groupby } from '@/util/Array';
import { scaleLinear } from 'd3-scale';
import { max, min, mean, quantile, median } from 'd3-array';
import { GroupStats, DataPoint, DataPointQueueNode } from './BoxPlot.types';


interface LinearScale {
    domain: [number, number] | number[];
    range: [number, number] | number[];
}


const exposedMethods = {
    prepareData(points: DataPoint[], height: number, pointSize: number, groupLabels: string[]) {
        const y = scaleLinear()
            .domain([0, max(points.map((i) => i.value)) as number])
            .range([height, 0]);

        exposedMethods.swarm_points(points, groupLabels, {domain: y.domain(), range: y.range()}, pointSize);

        const groupedData = Object.entries(groupby(points, (p) => p.group, groupLabels))
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([key, values]) => {
                return exposedMethods.computeGroupStats(values.map((dp) => dp.value), key, y);
        });

        const kdeMax = Math.max(...groupedData.map((g) => Math.max(...g.kde.map((k) => k[1]))));

        return {
            points,
            groupedData,
            domainY: y.domain(),
            domainKde: [-kdeMax, kdeMax],
        };
    },
    computeGroupStats(data: number[], group: string, scaleY): GroupStats {
        data = data.sort((a, b) => b - a);
        const kde = kernelDensityEstimator(epanechnikovKernel(.01), scaleY.ticks(100));
        const gstats = {
            group,
            count: data.length,
            min: min(data) as number,
            max: max(data) as number,
            mean: mean(data) as number,
            median: median(data) as number,
            q1: quantile(data, 0.25) as number,
            q2: quantile(data, 0.5) as number,
            q3: quantile(data, 0.75) as number,
            kde: kde(data),
        } as GroupStats;
        gstats.iqr = gstats.q1 - gstats.q3;
        return gstats as GroupStats;
    },
    swarm_points(data: DataPoint[], groupLabels: string[], scaleDefY: LinearScale, pointSize: number) {
        const scaleY = scaleLinear()
            .domain(scaleDefY.domain)
            .range(scaleDefY.range);

        groupLabels.map((g) => {
            const radius2 = (pointSize * 2.5) ** 2;
            let head: DataPointQueueNode | null = null;
            let tail: DataPointQueueNode | null = null;
            const indv = data.filter((ui) => ui.group === g)
                             .map((ui) => { ui.jitter = 0; return ui; }) as DataPointQueueNode[];

            const intersects = (x, y) => {
                const epsilon = 1e-5;
                let item = head;
                while (item) {
                    const dx = (item.jitter - x) ** 2;
                    const dy = (scaleY(item.value) - scaleY(y)) ** 2;
                    if (radius2 - epsilon >= dx + dy) {
                        return true;
                    }
                    item = item.next;
                }
                return false;
            };

            for (const b of indv) {
                // Remove circles from the queue that can’t intersect the new circle b.
                while (head && scaleY(head.value) < (scaleY(b.value) - radius2)) {
                    head = head.next;
                }
                // Choose the minimum non-intersecting tangent.
                b.jitter = 0;
                if (intersects(b.jitter, b.value)) {
                    let a = head;
                    b.jitter = Infinity;
                    do {
                        const dy = Math.sqrt(radius2 - (scaleY(a!.value) - scaleY(b.value)) ** 2);
                        const j = a!.jitter + dy;

                        if (j < b.jitter) {
                            if (!intersects(j, b.value)) {
                                b.jitter = j;
                            } else if (j < b.jitter && !intersects(-j, b.value)) {
                                b.jitter = -j;
                            }
                        }
                        a = a!.next;
                    } while (a);
                    if (b.jitter === Infinity) {
                        // console.log('Got Infinity?', b);
                    }
                }
                // Add b to the queue.
                b.next = null;
                if (head === null) {
                    head = tail = b;
                } else {
                    tail = tail!.next = b;
                }
            }
        });
        return data;
    },
};

function kernelDensityEstimator(kernel: (u: number) => number, x: number[]): (sample: number[]) => number[][] {
    return (sample: number[]) => {
        return x.map((y) => [y, mean(sample, (v: number) => kernel(y - v))]) as number[][];
    };
}
function epanechnikovKernel(scale: number): (u: number) => number {
    return (u: number) => {
        return Math.abs(u /= scale) <= 1 ? .75 * (1 - u * u) / scale : 0;
    };
}
expose(exposedMethods);
export type BoxPlotWorker = typeof exposedMethods;
