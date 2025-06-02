import { hexbin } from "d3-hexbin";
import { groupby } from "@render/util/Array";
import { scaleLinear } from "d3-scale";
import { extent } from "d3-array";

export interface Observation {
    x: number;
    y: number;
    id: string;
    group: string;
}

interface HexBin {
    x: number;
    y: number;
    length: number;
    z: number;
    [key: string]: any;
}

self.onmessage = (event: MessageEvent) => {
    const { type, payload } = event.data;

    if (type === "binData") {
        console.log("🔄 Processing binData...");
        const result = binData(payload);
        self.postMessage({ type: "binData", result: result });
    }
};

function binData({
    data,
    groupLabels,
    width,
    resolution,
}: {
    data: Observation[];
    groupLabels: string[] | null;
    width: number;
    resolution: number;
}) {
    const xScale = scaleLinear()
        .domain(extent(data, (d) => d.x) as [number, number])
        .range([0, width]);

    const yScale = scaleLinear()
        .domain(extent(data, (d) => d.y) as [number, number])
        .range([width, 0]);

    const hexer = hexbin<Observation>()
        .x((d) => xScale(d.x))
        .y((d) => yScale(d.y))
        .radius(resolution)
        .size([width, width]);

    const groupedData = groupLabels
        ? groupby(data, (p) => p.group, groupLabels)
        : groupby(data, () => "Overall", ["Overall"]);

    const binned: { [group: string]: HexBin[] } = {};
    for (const [group, values] of Object.entries(groupedData)) {
        const bins: HexBin[] = hexer(values).map(bin => ({
            x: bin.x,
            y: bin.y,
            length: bin.length,
            z: bin.length / values.length,
        }
    ));
    binned[group] = bins;
}
    const zmax = Math.max(
        ...Object.values(binned).flatMap((bins) => bins.map((bin) => bin.z))
    );

    return {
        binned,
        zmax,
        domainX: xScale.domain(),
        domainY: yScale.domain(),
    };
}
