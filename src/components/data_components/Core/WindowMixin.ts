import Vue from 'vue';
import { ComponentRegistration } from '@/store/root.types';
import { DataWindowState, Layout } from '@/store/datawindow.types';
import {unnest} from '@/util/Vuex';



const WindowMixin = Vue.extend({
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    computed: {
        subid(): string {
            return this.id.replace('datawindows/', '');
        },
        spec(): ComponentRegistration {
            return this.$store.getters[`${this.id}/spec`];
        },
        datasource(): string {
            return unnest(this.$store.state, this.id).datasource;
        },
        settings(): any {
            return unnest(this.$store.state, this.id).settings;
        },
        layout(): Layout {
            const w = unnest(this.$store.state, this.id) as DataWindowState;
            return {
                height: w.height,
                width: w.width,
                position: {
                    x: w.pos_x,
                    y: w.pos_y,
                },
            };
        },
        title(): string {
            return unnest(this.$store.state, this.id).title;
        },
    },
});
export default WindowMixin;
