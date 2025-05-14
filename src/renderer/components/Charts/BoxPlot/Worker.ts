import { groupby } from "@render/util/Array";
import { scaleLinear } from "d3-scale";
import { mean, quantile, extent } from "d3-array";
import type { GroupStats, DataPoint, DataPointQueueNode } from "@render/components/Charts/BoxPlot/BoxPlot.types";
import * as d3 from "d3";

interface LinearScale {
    domain: [number, number] | number[];
    range: [number, number] | number[];
}

self.onmessage = (event: MessageEvent) => {
    console.log("Worker received message:", event.data);
    const { type, payload } = event.data;

    if (type === "prepareData") {
        console.log("🔄 Processing prepareData...");
        const result = prepareData(payload);
        const cleanedResult = JSON.parse(JSON.stringify(result));
        self.postMessage({ type: "preparedData", cleanedResult });
    }
    if (type === "swarmPoints") {
        console.log("🔄 Processing swarmPoints...");
        const updatedPoints = swarm_points(
            payload.points,
            payload.groupLabels,
            payload.scaleDefY,
            payload.pointSize
        );
        console.log("📤 Sending swarmPointsUpdated:", updatedPoints);
        self.postMessage({ type: "swarmPointsUpdated", result: updatedPoints });
    }
};

function prepareData({
    points,
    height,
    pointSize,
    groupLabels,
    swarmPoints,
    kdeScale,
}: {
    points: DataPoint[];
    height: number;
    pointSize: number;
    groupLabels: string[];
    swarmPoints: boolean;
    kdeScale: number;
}) {
    const yExtent = extent(points.map((i) => i.value));
    if (yExtent[0] !== undefined && yExtent[1] !== undefined) {
        yExtent[0] = Math.min(0, yExtent[0]);
        yExtent[1] = Math.max(0, yExtent[1]);
    }

    const y = scaleLinear().domain(yExtent as number[]).range([height, 0]);

    if (swarmPoints) {
        swarm_points(points, groupLabels, { domain: y.domain(), range: y.range() }, pointSize);
    }

    const groupedData = Object.entries(groupby(points, (p) => p.group, groupLabels))
        .sort((a, b) => a[0].localeCompare(b[0])) // 🔹 **Restored Sorting**
        .map(([key, values]) => computeGroupStats(values.map((dp) => dp.value), key, y, kdeScale));

    const kdeMax = Math.max(...groupedData.map((g) => Math.max(...g.kde.map((k) => k[1]))));

    return {
        points,
        groupedData,
        domainY: y.domain(),
        domainKde: [-kdeMax, kdeMax],
    };
}

function computeGroupStats(
    data: number[],
    group: string,
    scaleY: d3.ScaleLinear<number, number>,
    kdeScale: number
): GroupStats {
    data = data.filter((v) => typeof v === "number").sort((a, b) => b - a);
    const kde = kernelDensityEstimator(epanechnikovKernel(kdeScale), scaleY.ticks(100));

    const [min, max] = extent(data) as [number, number];
    const q1 = quantile(data, 0.25) as number;
    const q2 = quantile(data, 0.5) as number;
    const q3 = quantile(data, 0.75) as number;
    const iqr = q3 - q1;

    const gstats: GroupStats = {
        group,
        count: data.length,
        mean: mean(data) || 0,
        median: q2,
        q1,
        q2,
        q3,
        iqr,
        min,
        max,
        kde: kde(data),
    };
    return gstats;
}

function kernelDensityEstimator(
    kernel: (u: number) => number,
    x: number[]
): (sample: number[]) => number[][] {
    return (sample: number[]) =>
        x.map((y) => [y, mean(sample, (v: number) => kernel(y - v)) || 0]);
}

function epanechnikovKernel(scale: number): (u: number) => number {
    return (u: number) =>
        Math.abs((u /= scale)) <= 1 ? (0.75 * (1 - u * u)) / scale : 0;
}

function swarm_points(data: DataPoint[], groupLabels: string[], scaleDefY: LinearScale, pointSize: number) {
    const scaleY = scaleLinear().domain(scaleDefY.domain).range(scaleDefY.range);

    groupLabels.forEach((g) => {
        const radius2 = (pointSize * 2.5) ** 2;
        let head: DataPointQueueNode | null = null;
        let tail: DataPointQueueNode | null = null;

        const indv = data
            .filter((ui) => ui.group === g)
            .map((ui) => {
                ui.jitter = 0;
                return ui;
            }) as DataPointQueueNode[];

        function intersects(x, y) {
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
        }

        for (const b of indv) {
            while (head && scaleY(head.value) < scaleY(b.value) - radius2) {
                head = head.next;
            }

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
                        } else if (!intersects(-j, b.value)) {
                            b.jitter = -j;
                        }
                    }
                    a = a!.next;
                } while (a);
            }

            b.next = null;
            if (head === null) {
                head = tail = b;
            } else {
                tail = tail!.next = b;
            }
        }
    });

    return data;
}
