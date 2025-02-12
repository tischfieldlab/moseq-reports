import { defineComponent } from "vue";

const LoadingMixin = defineComponent({
  beforeUpdate() {
    this.emitStartLoading();
  },
  updated() {
    this.emitFinishLoading();
  },
  methods: {
    emitStartLoading(): void {
      this.$emit("start-loading");
    },
    emitFinishLoading(): void {
      this.$emit("finish-loading");
    },
  },
});

export default LoadingMixin;
