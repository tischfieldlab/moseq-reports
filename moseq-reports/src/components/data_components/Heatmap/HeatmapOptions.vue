<template>
    <b-form-group label="Heatmap Colorscale" label-for="heat-color">
        <b-form-select 
            id="heat-color" 
            v-model="colorscale"
            :options="color_options"
            class="mb-3">
        </b-form-select>
    </b-form-group>
</template>

<script scoped lang="ts">
import Vue from 'vue';
import BaseDataComponent from '@/components/data_components/BaseDataComponent';

export default Vue.component('heatmap-options', {
    extends: BaseDataComponent,
    computed: {
        colorscale: {
            get() {
                return this.settings.style.colorscale;
            },
            set(value) {
                this.$store.commit('updateComponentSettings', { 
                    id: this.id, 
                    settings: { 
                        style: { 
                            colorscale: value 
                        }
                    }
                });
            }
        }
    },
    data() {
        return {
            color_options: [
                { text: 'Blackbody', value: 'Blackbody' },
                { text: 'Electric', value: 'Electric' },
                { text: 'Earth', value: 'Earth' },
                { text: 'Bluered', value: 'Bluered' },
                { text: 'RdBu', value: 'RdBu' },
                { text: 'Portland', value: 'Portland' },
                { text: 'Picnic', value: 'Picnic' },
                { text: 'Jet', value: 'Jet' },
            ],
        };
    },
});
</script>

<style lang="scss" scoped>

</style>
