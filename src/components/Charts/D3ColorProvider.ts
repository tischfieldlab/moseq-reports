


import * as d3ScaleChromatic from 'd3-scale-chromatic';
import {ScaleLinear, ScaleContinuousNumeric} from 'd3-scale';


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
    return d3ScaleChromatic[name] as ((t: number) => string) | string[];
}
export function GetScaleWithOpacity(name: string, opacity: any) {
    const base = GetScale(name) as (t: number) => string;
    return (t: number) => {
        const out = (base(t) as string)
            .replace('rgb', 'rgba')
            .replace(')', `, ${opacity(t)})`);
        // console.log(t, base(t), opacity(t), out);
        return out;
    };
}
