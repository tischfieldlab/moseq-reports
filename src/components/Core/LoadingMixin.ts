import Vue from 'vue';


const LoadingMixin = Vue.extend({
    beforeUpdate() {
        this.$emit('start-loading');
    },
    updated() {
        this.$emit('finish-loading');
    },
});
export default LoadingMixin;
