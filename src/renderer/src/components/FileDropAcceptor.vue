<template>
    <Portal>
        <div
            ref="acceptor"
            v-show="is_file_hover"
            class="file-acceptor-wrapper"
        >
            <div class="file-acceptor"></div>
            <b-card
                bg-variant="primary"
                text-variant="white"
                class="text-center"
            >
                <b-card-text>
                    Drop your
                    <code text-variant="white"
                        >.{{ file_associations[0].ext }}</code
                    >
                    Data Bundle or
                    <code text-variant="white"
                        >.{{ file_associations[1].ext }}</code
                    >
                    Layout files here!
                </b-card-text>
            </b-card>
        </div>
    </Portal>
</template>

<script lang="ts">
import Vue from "vue";
import { Portal } from "@linusborg/vue-simple-portal";

import { LoadDataFile, DataFileExt } from "../commands/LoadData";
import { LoadLayoutFile, LayoutFileExt } from "../commands/LoadLayout";

export default Vue.extend({
    components: {
        Portal,
    },
    data() {
        return {
            is_file_hover: false,
            file_associations: [
                {
                    ext: DataFileExt,
                    handler: LoadDataFile,
                },
                {
                    ext: LayoutFileExt,
                    handler: LoadLayoutFile,
                },
            ],
        };
    },
    async mounted() {
        await this.$nextTick();
        this.watchDrop();
    },
    beforeDestroy() {
        this.unwatchDrop();
    },
    methods: {
        watchDrop() {
            const parent = document.body;
            const self = this.$refs.acceptor as HTMLElement;

            parent.addEventListener("dragenter", this.onFileDragEnter);
            parent.addEventListener("dragover", this.dragEventPreventDefault);
            parent.addEventListener("dragleave", this.dragEventPreventDefault);
            parent.addEventListener("drop", this.dragEventPreventDefault);

            self.addEventListener("dragleave", this.hideOverlay);
            self.addEventListener("drop", this.onFileDrop);
        },
        unwatchDrop() {
            const parent = document.body;
            const self = this.$refs.acceptor as HTMLElement;

            parent.removeEventListener("dragenter", this.onFileDragEnter);
            parent.removeEventListener(
                "dragover",
                this.dragEventPreventDefault
            );
            parent.removeEventListener(
                "dragleave",
                this.dragEventPreventDefault
            );
            parent.removeEventListener("drop", this.dragEventPreventDefault);

            self.removeEventListener("dragleave", this.hideOverlay);
            self.removeEventListener("drop", this.onFileDrop);
        },
        hideOverlay(ev: DragEvent) {
            this.is_file_hover = false;
            ev.preventDefault();
        },
        dragEventPreventDefault(ev: DragEvent) {
            ev.preventDefault();
        },
        onFileDragEnter(ev: DragEvent) {
            if (
                ev &&
                ev.dataTransfer &&
                ev.composedPath().includes(this.$parent.$el)
            ) {
                this.is_file_hover = true;
                ev.preventDefault();
            }
        },
        onFileDrop(ev: DragEvent) {
            this.is_file_hover = false;
            if (ev && ev.dataTransfer) {
                const filepath = ev.dataTransfer.files[0].path;
                for (const assoc of this.file_associations) {
                    const ext = filepath.substr(-assoc.ext.length);
                    if (ext.toLowerCase() === assoc.ext.toLowerCase()) {
                        assoc.handler(filepath);
                    }
                }
                ev.preventDefault();
            }
        },
    },
});
</script>

<style scoped>
.file-acceptor-wrapper {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    z-index: 2147483647;
}
.file-acceptor {
    width: 100%;
    height: 100%;
    border: 1em dashed #666;
    background: #e9ecef;
    opacity: 0.8;
}
.file-acceptor-wrapper * {
    pointer-events: none;
}
.card {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 99999;
}
code {
    color: #afafaf;
}
</style>
