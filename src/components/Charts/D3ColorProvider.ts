


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

/**
 * Find an appropriate foreground color for background color `hexcolor`
 * @param hexcolor (string) background color
 * @returns 'dark'|'light'
 */
export function getContrastingColor(hexcolor: string): 'dark'|'light' {
    try {
        // If a leading # is provided, remove it
        if (hexcolor.slice(0, 1) === '#') {
            hexcolor = hexcolor.slice(1);
        }
        // If a three-character hexcode, make six-character
        if (hexcolor.length === 3) {
            hexcolor = hexcolor.split('').map((hex) => hex + hex).join('');
        }
        // Convert to RGB value
        const r = parseInt(hexcolor.substr(0,2),16);
        const g = parseInt(hexcolor.substr(2,2),16);
        const b = parseInt(hexcolor.substr(4,2),16);
        // Get YIQ ratio
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        // Check contrast
        return (yiq >= 128) ? 'dark' : 'light';
    } catch {
        return 'dark';
    }
}
