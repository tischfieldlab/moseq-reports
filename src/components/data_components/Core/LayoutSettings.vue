<template>
    <b-container fluid>
        <b-row>
            <b-col cols="2" align-self="center">
                <label class="font-weight-bold pt-0">Title</label>
            </b-col>
            <b-col>
                <b-form-input type="text" v-model.trim="title" />
            </b-col>
        </b-row>
        <b-row>
            <b-col cols="2" align-self="center">
                <label class="font-weight-bold pt-0">Size</label>
            </b-col>
            <b-col>
                <b-input-group prepend="W">
                    <b-form-input type="number" debounce="500" v-model.number="width" />
                </b-input-group>
            </b-col>
            <b-col>
                <b-input-group prepend="H">
                    <b-form-input type="number" debounce="500" v-model.number="height" />
                </b-input-group>
            </b-col>
        </b-row>
        <b-row>
            <b-col cols="2" align-self="center">
                <label class="font-weight-bold pt-0">Position</label>
            </b-col>
            <b-col>
                <b-input-group prepend="X">
                    <b-form-input type="number" debounce="500" v-model.number="position_x" />
                </b-input-group>
            </b-col>
            <b-col>
                <b-input-group prepend="Y">
                    <b-form-input type="number" debounce="500" v-model.number="position_y" />
                </b-input-group>
            </b-col>
        </b-row>
    </b-container>
</template>


<script lang="ts">
import Vue from 'vue';
import {Layout, UpdateComponentLayoutPayload, UpdateComponentTitlePayload, DataWindow} from '@/store/root.types';

export default Vue.component('layout-settings', {
    props: {
        id: {
            type: Number,
            required: true,
        },
    },
    computed: {
        layout(): Layout {
            const win = this.$store.getters.getWindowById(this.id).layout;
            return win;
        },
        width: {
            get(): number {
                return this.layout.width;
            },
            set(value: number) {
                this.$store.commit('updateComponentLayout', {
                    id: this.id,
                    width: value,
                } as UpdateComponentLayoutPayload);
            },
        },
        height: {
            get(): number {
                return this.layout.height;
            },
            set(value: number) {
                this.$store.commit('updateComponentLayout', {
                    id: this.id,
                    height: value,
                } as UpdateComponentLayoutPayload);
            },
        },
        position_x: {
            get(): number {
                return this.layout.position.x;
            },
            set(value: number) {
                this.$store.commit('updateComponentLayout', {
                    id: this.id,
                    position_x: value,
                } as UpdateComponentLayoutPayload);
            },
        },
        position_y: {
            get(): number {
                return this.layout.position.y;
            },
            set(value: number) {
                this.$store.commit('updateComponentLayout', {
                    id: this.id,
                    position_y: value,
                } as UpdateComponentLayoutPayload);
            },
        },
        title: {
            get(): string {
                return this.$store.getters.getWindowById(this.id).title;
            },
            set(value: string) {
                this.$store.commit('updateComponentTitle', {
                    id: this.id,
                    title: value,
                } as UpdateComponentTitlePayload);
            },
        },
    },
});
</script>

<style scoped>
.row{
    margin:10px 0;
}
.input-group-text{
    width:40px;
    text-align: center;
}
</style>