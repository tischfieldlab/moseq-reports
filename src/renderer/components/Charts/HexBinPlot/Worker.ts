import { hexbin } from "d3-hexbin";
import { groupby } from "@render/util/Array";
import { scaleLinear } from "d3-scale";
import { extent } from "d3-array";
import { Observation, HexBin } from "./HexBinPlot.types"

export function binData(data: Observation[], groupLabels: string[] | null, width: number, resolution: number,) {
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
