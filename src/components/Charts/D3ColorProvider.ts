


import * as d3ScaleChromatic from 'd3-scale-chromatic';


export function GetInterpolatedScaleOptions() {
    const options = new Array<{text: string, value: string}>();
    for (const scale in d3ScaleChromatic) {
        if (scale.startsWith('interpolate')) {
            options.push({
                text: scale.replace('interpolate', ''),
                value: scale,
            });
        }
    }
    return options;
}
export function GetScale(name: string) {
    return d3ScaleChromatic[name] as (t: number) => string | string[];
}
