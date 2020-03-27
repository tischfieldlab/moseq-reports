import Vue from 'vue';
import {unnest} from '@/util/Vuex';



const WindowOptionsMixin = Vue.extend({
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    computed: {
        datasource(): string {
            return unnest(this.$store.state, this.id).datasource;
        },
        settings(): any {
            return unnest(this.$store.state, this.id).settings;
        },
    },
});
export default WindowOptionsMixin;
