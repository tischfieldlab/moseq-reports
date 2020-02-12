<template>
    <b-container fluid>
        <b-row>
            <b-col cols="3" align-self="center">
                <label class="font-weight-bold pt-0">Line Color</label>
            </b-col>
            <b-col>
                <chrome-picker v-model="line_color" />
            </b-col>
        </b-row>
    </b-container>
</template>

<script scoped lang="ts">
import Vue from 'vue';
import { Chrome } from 'vue-color';

export default Vue.component('spinogram-options', {
    components: {
        'chrome-picker': Chrome,
    },
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
        line_color: {
            get(): string {
                return this.settings.line_color;
            },
            set(value: any) {
                this.$store.commit('updateComponentSettings', {
                    id: this.id,
                    settings: {
                        line_color: value.hex,
                    },
                });
            },
        },
    },
    data() {
        return {
        };
    },
});
</script>

<style lang="scss" scoped>
.row{
    margin:10px 0;
}
</style>
