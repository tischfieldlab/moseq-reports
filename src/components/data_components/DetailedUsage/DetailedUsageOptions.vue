<template>
    <b-container fluid>
        <b-row>
             <label class="font-weight-bold pt-0">Plot Element Visibility</label>
        </b-row>
        <b-row>
            <b-form-checkbox v-model="show_points" switch>
                Show Individual Data Points
            </b-form-checkbox>
        </b-row>
        <b-row>
            <b-form-checkbox v-model="show_boxplot" switch>
                Show Boxplot
            </b-form-checkbox>
        </b-row>
        <b-row>
            <b-form-checkbox v-model="show_violinplot" switch>
                Show Violin Plot
            </b-form-checkbox>
        </b-row>
    </b-container>
</template>

<script scoped lang="ts">
import Vue from 'vue';

export default Vue.component('detailed-usage-options', {
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
        show_points: {
            get(): boolean {
                return this.settings.show_points;
            },
            set(value: boolean) {
                this.$store.commit('updateComponentSettings', {
                    id: this.id,
                    settings: {
                        show_points: value,
                    },
                });
            },
        },
        show_boxplot: {
            get(): boolean {
                return this.settings.show_boxplot;
            },
            set(value: boolean) {
                this.$store.commit('updateComponentSettings', {
                    id: this.id,
                    settings: {
                        show_boxplot: value,
                    },
                });
            },
        },
        show_violinplot: {
            get(): boolean {
                return this.settings.show_violinplot;
            },
            set(value: boolean) {
                this.$store.commit('updateComponentSettings', {
                    id: this.id,
                    settings: {
                        show_violinplot: value,
                    },
                });
            },
        },
    },
    data() {
        return {};
    },
});
</script>

<style lang="scss" scoped>
.row{
    margin:10px 0;
}
</style>
