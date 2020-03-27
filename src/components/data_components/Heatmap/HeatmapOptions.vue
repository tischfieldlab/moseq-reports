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
    </b-container>
</template>

<script scoped lang="ts">
import Vue from 'vue';
import mixins from 'vue-typed-mixins';
import WindowOptionsMixin from '../Core/WindowOptionsMixin';

export default mixins(WindowOptionsMixin).extend({
    computed: {
        colorscale: {
            get(): string {
                return this.settings.style.colorscale;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
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
