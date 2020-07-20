import Vue from 'vue';


const LoadingMixin = Vue.extend({
    beforeUpdate() {
        this.emitStartLoading();
    },
    updated() {
        this.emitFinishLoading();
    },
    methods: {
        emitStartLoading() {
            this.$emit('start-loading');
        },
        emitFinishLoading() {
            this.$emit('finish-loading');
        },
    },
});
export default LoadingMixin;
