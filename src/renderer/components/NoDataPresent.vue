<template>
    <div class="has-no-data-container" draggable="false">
        <BImg
            :style="{ visibility: show_background ? 'visible' : 'hidden' }"
            src="/img/mouse.png"
            fluid
            draggable="false"
            class="no-data-img" />
        <h4 :style="{ visibility: show_help_text ? 'visible' : 'hidden' }" class="text-center mt-3">
            No data loaded. Please
            <BLink href="#" @click.prevent="initiateFileOpen" class="text-primary">
                load some data
            </BLink>
            by clicking <strong>File &rarr; Open File</strong>.
        </h4>
    </div>
</template>
<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from "vue";
import { EventEmitter } from "@render/util/EventEmitter";
import loadDataCommand from "@render/commands/LoadData";

export default defineComponent({
    name: "NoDataPlaceholder",
    setup() {
        const show_help_text = ref(true);
        const show_background = ref(true);

        const handleBeginDatasetLoad = () => {
            show_help_text.value = false;
        };

        const handleFailDatasetLoad = () => {
            show_help_text.value = true;
        };

        onMounted(() => {
            EventEmitter.on("begin-dataset-load", handleBeginDatasetLoad);
            EventEmitter.on("fail-dataset-load", handleFailDatasetLoad);
        });

        onUnmounted(() => {
            EventEmitter.off("begin-dataset-load", handleBeginDatasetLoad);
            EventEmitter.off("fail-dataset-load", handleFailDatasetLoad);
        });

        const initiateFileOpen = () => {
            loadDataCommand();
        };

        return {
            show_help_text,
            show_background,
            initiateFileOpen,
        };
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
    -webkit-user-select: none;
    user-select: none;
    -webkit-user-drag: none;
    user-drag: none;
}

.no-data-img {
    opacity: 0.2;
    margin-top: -10%;
    pointer-events: none;
    -webkit-user-select: none;
    user-select: none;
    -webkit-user-drag: none;
    user-drag: none;
    max-width: 50%; /* Ensures the image scales responsively */
}

.has-no-data-container h4 {
    pointer-events: none;
    user-select: none;
    color: #495057;
}

.has-no-data-container h4 a {
    pointer-events: auto;
    text-decoration: none;
    transition: color 0.3s ease;
}

.has-no-data-container h4 a:hover {
    color: #0056b3;
}

.text-primary {
    font-weight: bold;
}

</style>
