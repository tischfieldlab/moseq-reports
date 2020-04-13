<template>
    <div v-show="is_file_hover" class="file-acceptor-wrapper">
        <div class="file-acceptor"></div>
        <b-card bg-variant="primary" text-variant="white" class="text-center">
            <b-card-text>
                Drop your <code text-variant="white">.msq</code> Data Bundle or 
                <code text-variant="white">.json</code> Layout files here!
            </b-card-text>
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
            const parent = this.$parent.$el as HTMLElement;
            const self = this.$el as HTMLElement;

            parent.addEventListener('dragenter', this.onFileDragEnter);
            parent.addEventListener('dragover', this.dragEventPreventDefault);
            parent.addEventListener('dragleave', this.dragEventPreventDefault);
            parent.addEventListener('drop', this.dragEventPreventDefault);

            self.addEventListener('dragleave', this.hideOverlay);
            self.addEventListener('drop', this.onFileDrop);
        },
        unwatchDrop() {
            const parent = this.$parent.$el as HTMLElement;
            const self = this.$el as HTMLElement;

            parent.removeEventListener('dragenter', this.onFileDragEnter);
            parent.removeEventListener('dragover', this.dragEventPreventDefault);
            parent.removeEventListener('dragleave', this.dragEventPreventDefault);
            parent.removeEventListener('drop', this.dragEventPreventDefault);

            self.removeEventListener('dragleave', this.hideOverlay);
            self.removeEventListener('drop', this.onFileDrop);
        },
        hideOverlay(ev: DragEvent) {
            this.is_file_hover = false;
            ev.preventDefault();
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
}
.file-acceptor {
    width: 100%;
    height: 100%;
    border: 1em dashed #666;
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