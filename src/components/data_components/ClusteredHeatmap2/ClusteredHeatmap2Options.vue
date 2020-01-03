<template>
    <b-container fluid>
        <b-row>
            <b-col cols="3" align-self="center">
                <label label-for="heat-color" class="font-weight-bold pt-0">Colormap</label>
            </b-col>
            <b-col>
                <b-form-select 
                    id="heat-color" 
                    v-model="colorscale"
                    :options="color_options"
                    class="mb-3">
                </b-form-select>
            </b-col>
        </b-row>
        <b-row>
            <b-form-checkbox v-model="cluster_syllables" switch>
                Cluster Syllables
            </b-form-checkbox>
        </b-row>
        <b-row>
            <b-form-checkbox v-model="cluster_groups" switch>
                Cluster Groups
            </b-form-checkbox>
        </b-row>
    </b-container>
</template>

<script scoped lang="ts">
import Vue from 'vue';

export default Vue.component('clustered-heatmap-options', {
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
        colorscale: {
            get(): string {
                return this.settings.style.colorscale;
            },
            set(value: string) {
                this.$store.commit('updateComponentSettings', {
                    id: this.id,
                    settings: {
                        style: {
                            colorscale: value,
                        },
                    },
                });
            },
        },
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
.row{
    margin:10px 0;
}
</style>
