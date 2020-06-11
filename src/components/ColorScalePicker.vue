<template>
    <div class="picker-container">
        <b-dropdown variant="white" no-flip="true">
            <template v-slot:button-content>
                <div v-if="selected" class="selected-value">
                    <svg height="20px" width="150">
                        <defs>
                            <linearGradient :id="$id(`color-gradiant-${selected.value}`)" :x1="offsets.x1" :x2="offsets.x2" :y1="offsets.y1" :y2="offsets.y2">
                                <template v-for="d in scale(selected.value)">
                                    <stop 
                                        :key="d.v"
                                        :offset="`${d.v}%`"
                                        :stop-color="d.z" />
                                </template>
                            </linearGradient>
                        </defs>
                        <rect
                            x="0"
                            y="0"
                            width="100%"
                            height="100%"
                            :fill="`url(${$idRef(`color-gradiant-${selected.value}`)})`"
                            />
                    </svg>
                    {{selected.text}}
                </div>
                <template v-else>
                    Please select some item
                </template>
            </template>
            <b-dropdown-item
                v-for="option in options"
                :key="option.value"
                :disabled="option.disabled"
                @click="select(option)" >
                <div>
                    <svg height="20px" width="150">
                        <defs>
                            <linearGradient :id="$id(`color-gradiant-${option.value}`)" :x1="offsets.x1" :x2="offsets.x2" :y1="offsets.y1" :y2="offsets.y2">
                                <template v-for="d in scale(option.value)">
                                    <stop 
                                        :key="d.v"
                                        :offset="`${d.v}%`"
                                        :stop-color="d.z" />
                                </template>
                            </linearGradient>
                        </defs>
                        <rect
                            x="0"
                            y="0"
                            width="100%"
                            height="100%"
                            :fill="`url(${$idRef(`color-gradiant-${option.value}`)})`"
                            />
                    </svg>
                    {{option.text}}
                </div>
            </b-dropdown-item>
        </b-dropdown>
    </div>
</template>


<script lang="ts">
import Vue from 'vue';
import {GetInterpolatedScaleOptions, GetScale} from '@/components/Charts/D3ColorProvider';
import { scaleSequential } from 'd3-scale';
import {range} from 'd3-array';



export default Vue.extend({
    props: {
        value: {
            type: String,
        },
    },
    data() {
        return {
            selected: undefined as {text: string, value: string}|undefined,
            options: GetInterpolatedScaleOptions(),
            offsets: {
                x1: '0%',
                x2: '100%',
                y1: '0%',
                y2: '0%',
            },
        };
    },
    watch: {
        value: {
            handler(newValue) {
                this.selected = this.options.find((o) => o.value === newValue);
            },
            immediate: true,
        },
    },
    methods: {
        scale(interpolator) {
            const z = scaleSequential(GetScale(interpolator))
                        .domain([0, 1]);
            return range(0, 1.1, 0.05).map((v) => ({ v: v * 100, z: z(v) }));
        },
        select(option) {
            this.selected = option;
            this.$emit('input', option.value);
        },
    },
});
</script>

<style scoped>
.selected-value {
    display: inline-block;
}
.picker-container >>> .dropdown-menu {
    max-height:400px;
    overflow-y: auto;
}
.b-dropdown >>> .btn {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-color: rgb(206, 212, 218);
    background: #ffffff;
}
</style>