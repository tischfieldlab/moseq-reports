<template>
    <div ref='container'></div>
</template>

<script lang="ts">
import Vue from 'vue';


import * as Plotly from 'plotly.js-dist';
import { transpose } from '@/Util';
import {Size, Layout, ComponentRegistration } from '@/store/root.types';
import store from '@/store/root.store';

store.commit('registerComponent', {
    friendly_name: 'Usage Heatmap',
    component_type: 'heat-map',
    settings_type: 'heatmap-options',
    init_width: 400,
    init_height: 500,
    default_settings: {
        style: {
            colorscale: 'Portland',
        },
    },
});

interface PlotHTMLElement extends HTMLElement  {
  on(eventName: string, handler: (data: any) => void): void;
}


export default Vue.component('heat-map', {
    props: {
        id: {
            type: Number,
            required: true,
        },
    },
    computed: {
        settings(): any {
            return this.$store.getters.getWindowById(this.id).settings;
        },
        layout(): Layout {
            const win = this.$store.getters.getWindowById(this.id);
            return win.layout;
        },
        aggregateView(): any {
            return this.$store.getters['dataview/aggregateView'];
        },
    },
    watch: {
        aggregateView() {
            this.createHeatmap();
        },
    },
    mounted() {
        // watch for resize events, and update the heatmap size accordingly.
        this.watchers.push(this.$store.watch(
            (state, getters) => {
                return getters.getWindowLayout(this.id);
            },
            (newValue: Layout, oldValue: Layout) => {
                this.onResize({
                    width: newValue.width,
                    height: newValue.height,
                });
            },
            {
                deep: true,
            },
        ));
        this.watchers.push(this.$store.watch(
            (state, getters) => {
                return getters.getWindowById(this.id).settings;
            },
            (newValue, oldValue) => {
                Plotly.restyle(this.$refs.container as HTMLElement, this.settings.style);
            },
            {
                deep: true,
            },
        ));

        this.createHeatmap();
    },
    destroyed() {
        // un-watch the store
        this.watchers.forEach((w) => w());
    },
    data() {
        return {
            watchers: Array<(() => void)>(),
        };
    },
    methods: {
        onResize(newSize: Size) {
            Plotly.relayout(this.$refs.container as HTMLElement, {
                width: newSize.width - 10,
                height: newSize.height - 100,
            });
        },
        createHeatmap() {
            const df = this.aggregateView;
            if (df === null) {
                return;
            }

            const groups = this.$store.state.dataview.selectedGroups;
            const sylNum = df.select('syllable').distinct('syllable').toArray().flat();

            let sylUsage = [] as number[][];
            for (const g of groups) {
                sylUsage.push(df.where({group: g}).select('usage').toArray().flat() as []);
            }
            sylUsage = transpose(sylUsage);

            const myPlot = this.$refs.container as PlotHTMLElement;

            const data = {
                type: 'heatmap',
                x: groups,
                y: sylNum,
                z: sylUsage,
                colorscale: this.settings.style.colorscale,
                hovertemplate: 'Group: %{x}<br />Module: %{y}<br />Usage: %{z:.4g}<extra></extra>',
            } as Plotly.PlotData;

            const layout = {
                // title: 'Syllable Usage Heatmap',
                margin: {
                    t: 10,
                    b: 70,
                    l: 50,
                    r: 10,
                },
                width: this.layout.width - 10,
                height: this.layout.height - 100,
                autosize: true,
                xaxis: {
                    autorange: true,
                    showgrid: false,
                    zeroline: false,
                    linecolor: 'black',
                    showticklabels: true,
                    side: 'bottom',
                    ticks: 'outside',
                },
                yaxis: {
                    showgrid: false,
                    zeroline: false,
                    linecolor: 'black',
                    showticklabels: true,
                    tick0: 0,
                    dtick: 1,
                    autorange: true,
                    side: 'left',
                    ticks: 'outside',
                    title: 'Syllable (ID)',
                },
            } as Plotly.Layout;

            Plotly.newPlot(myPlot, [data], layout);

            myPlot.on('plotly_click', (event: any) => {
                if (event.points.length > 0) {
                    this.$store.commit('dataview/setSelectedSyllable', Number.parseInt(event.points[0].y, 10));
                }
            });
        },
    },
});
</script>

<style scoped lang="scss">

</style>
