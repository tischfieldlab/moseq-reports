import * as d3ScaleChromatic from "d3-scale-chromatic";
import { interpolateRgb } from "d3-interpolate";

const ScaleCategories = {
  Diverging: [
    "interpolateBrBG",
    "interpolatePRGn",
    "interpolatePiYG",
    "interpolatePuOr",
    "interpolateRdBu",
    "interpolateRdGy",
    "interpolateRdYlBu",
    "interpolateRdYlGn",
    "interpolateSpectral",
  ],
  "Sequential (Single Hue)": [
    "interpolateBlues",
    "interpolateGreens",
    "interpolateGreys",
    "interpolateOranges",
    "interpolatePurples",
    "interpolateReds",
  ],
  "Sequential (Multi-Hue)": [
    "interpolateTurbo",
    "interpolateViridis",
    "interpolateInferno",
    "interpolateMagma",
    "interpolatePlasma",
    "interpolateCividis",
    "interpolateWarm",
    "interpolateCool",
    "interpolateCubehelixDefault",
    "interpolateBuGn",
    "interpolateBuPu",
    "interpolateGnBu",
    "interpolateOrRd",
    "interpolatePuBuGn",
    "interpolatePuBu",
    "interpolatePuRd",
    "interpolateRdPu",
    "interpolateYlGnBu",
    "interpolateYlGn",
    "interpolateYlOrBr",
    "interpolateYlOrRd",
  ],
  Cyclical: ["interpolateRainbow", "interpolateSinebow"],
};

/*
// example: how to inject custom interpolators globally
Object.defineProperty(d3ScaleChromatic, 'interpolateYellows', {
    value: interpolateRgbBasis(['#FFFFFF', '#BFB499']),
});
ScaleCategories['Sequential (Single Hue)'].push('interpolateYellows');
*/

function GetCategoryForScale(scaleName: string): string {
  const cats = Object.getOwnPropertyNames(ScaleCategories);
  for (const cat in cats) {
    if ((ScaleCategories[cat] as string[]).includes(scaleName)) {
      return cat;
    }
  }
  return "Unknown";
}

export function GetInterpolatedScaleOptions() {
  return Object.fromEntries(
    Object.entries(ScaleCategories).map(([cat, catScales]) => {
      return [
        cat,
        catScales.map((scale) => {
          return {
            text: scale.replace("interpolate", ""),
            category: cat,
            value: scale,
          };
        }),
      ];
    })
  );
}
export function GetScale(name: string) {
  if (name.startsWith("custom:")) {
    const parts = name.split(":");
    return interpolateRgb(parts[1], parts[2]);
  } else {
    return d3ScaleChromatic[name] as ((t: number) => string) | string[];
  }
}
export function GetScaleWithOpacity(name: string, opacity: any) {
  const base = GetScale(name) as (t: number) => string;
  return (t: number) => {
    const out = (base(t) as string).replace("rgb", "rgba").replace(")", `, ${opacity(t)})`);
    // console.log(t, base(t), opacity(t), out);
    return out;
  };
}

/**
 * Find an appropriate foreground color for background color `hexcolor`
 * @param hexcolor (string) background color
 * @returns 'dark'|'light'
 */
export function getContrastingColor(hexcolor: string): "dark" | "light" {
  try {
    // If a leading # is provided, remove it
    if (hexcolor.slice(0, 1) === "#") {
      hexcolor = hexcolor.slice(1);
    }
    // If a three-character hexcode, make six-character
    if (hexcolor.length === 3) {
      hexcolor = hexcolor
        .split("")
        .map((hex) => hex + hex)
        .join("");
    }
    // Convert to RGB value
    const r = parseInt(hexcolor.substr(0, 2), 16);
    const g = parseInt(hexcolor.substr(2, 2), 16);
    const b = parseInt(hexcolor.substr(4, 2), 16);
    // Get YIQ ratio
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    // Check contrast
    return yiq >= 128 ? "dark" : "light";
  } catch {
    return "dark";
  }
}
