import { App, Plugin } from 'vue'
import { axisBottom, axisLeft } from 'd3-axis'
import { select } from 'd3-selection'

function draw_axis(el, binding) {
    const axis = binding.arg;
    if (axis !== undefined) {
        const axisMethod = { x: axisBottom, y: axisLeft }[axis];
        if (!axisMethod) {
            console.warn(`Invalid axis argument: ${axis}! Must be 'x' or 'y'.`);
            return;
        }
        const methodArg = binding.value[axis];
        select(el).call(axisMethod(methodArg));
    }
}

export const D3AxisDirective: Plugin = {
    install: (app: App, options: any) => {
        app.directive('axis', {
            mounted: draw_axis,
            updated: draw_axis,
        });
    }
}



