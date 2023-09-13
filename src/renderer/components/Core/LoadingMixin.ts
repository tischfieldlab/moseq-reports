import {defineComponent} from "vue";

const LoadingMixin = defineComponent({
  beforeUpdate() {
    this.emitStartLoading();
  },
  updated() {
    this.emitFinishLoading();
  },
  methods: {
    emitStartLoading() {
      this.$emit("start-loading");
    },
    emitFinishLoading() {
      this.$emit("finish-loading");
    },
  },
});
export default LoadingMixin;
