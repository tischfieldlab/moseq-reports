<template>
    <div v-show="is_file_hover" class="file-acceptor-wrapper">
        <div class="file-acceptor"></div>
        <b-card bg-variant="primary" text-variant="white">
            <b-card-text>Drop your <code text-variant="white">.msq</code> Data Bundle or <code text-variant="white">.json</code> Layout files here!</b-card-text>
        </b-card>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {LoadDataFile} from '@/commands/LoadData';
import {LoadLayoutFile} from '@/commands/LoadLayout';

export default Vue.extend({
    data() {
        return {
            is_file_hover: false,
            file_associations: [
                {
                    ext: 'msq',
                    handler: LoadDataFile,
                },
                {
                    ext: 'json',
                    handler: LoadLayoutFile,
                },
            ],
        };
    },
    mounted() {
        this.watchDrop();
    },
    beforeDestroy() {
        this.unwatchDrop();
    },
    methods: {
        watchDrop() {
            document.addEventListener('dragover', this.dragEventPreventDefault);
            document.addEventListener('dragleave', this.dragEventPreventDefault);
            document.addEventListener('drop', this.dragEventPreventDefault);

            document.addEventListener('dragenter', this.onFileDragEnter);
            this.$el.addEventListener('dragleave', this.hideOverlay);
            document.addEventListener('drop', this.onFileDrop);
        },
        unwatchDrop() {
            document.removeEventListener('dragenter', this.dragEventPreventDefault);
            document.removeEventListener('dragleave', this.dragEventPreventDefault);
            document.removeEventListener('drop', this.dragEventPreventDefault);

            document.removeEventListener('drop', this.onFileDrop);
            this.$el.removeEventListener('dragleave', this.hideOverlay);
            document.removeEventListener('dragenter', this.onFileDragEnter);
        },
        hideOverlay() {
            this.is_file_hover = false;
        },
        dragEventPreventDefault(ev: DragEvent) {
            ev.preventDefault();
        },
        onFileDragEnter(ev: DragEvent) {
            if (ev && ev.dataTransfer) {
                this.is_file_hover = true;
                ev.preventDefault();
            }
        },
        onFileDrop(ev: DragEvent) {
            this.hideOverlay();
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
.file-acceptor {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    border: 1em dashed #666;
    position: fixed;
    top: 0;
    background: #e9ecef;
    opacity: 0.8;
    z-index: 99998;
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