import Vue from 'vue';
import { VueConfiguration } from 'vue/types/vue';
import { Layout } from '@/store/root.types';

export default {
    props: {
        id: Number,
    },
    computed: {
        settings(): Object {
            return this.$store.getters.getWindowById(this.id).settings;
        },
        layout(): Layout {
            const win = this.$store.getters.getWindowById(this.id);
            return win.layout;
        },
    }
}