<template>
    <div class="has-no-data-container">
        <img
            :style="{ visibility: show_background ? 'visible' : 'hidden' }"
            src="/img/mouse.png"
        />
        <h4 :style="{ visibility: show_help_text ? 'visible' : 'hidden' }">
            No data loaded. Please
            <a href="#" @click="initiateFileOpen">load some data</a>
            by clicking File > Open File.
        </h4>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import loadDataCommand from "../commands/LoadData";

export default Vue.extend({
    data() {
        return {
            show_help_text: true,
            show_background: true,
        };
    },
    mounted() {
        this.$root.$on(
            "begin-dataset-load",
            () => (this.show_help_text = false)
        );
        this.$root.$on("fail-dataset-load", () => (this.show_help_text = true));
    },
    methods: {
        initiateFileOpen(): void {
            loadDataCommand();
        },
    },
});
</script>

<style scoped>
.has-no-data-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: inherit;
}
.has-no-data-container img {
    opacity: 0.2;
    margin-top: -10%;
    pointer-events: none;
    user-select: none;
}
.has-no-data-container h4 {
    margin-top: -80px;
    pointer-events: none;
    user-select: none;
}
.has-no-data-container h4 a {
    pointer-events: auto;
}
</style>
