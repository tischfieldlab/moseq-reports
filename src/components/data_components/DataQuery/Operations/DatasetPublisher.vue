<template>
    <b-card no-body>
        <template #header>
            <b-button
                @click="downloadData()"
                title="Download Result"
                v-b-tooltip.hover
                variant="link"
                class="float-right download-button">
                <b-icon icon="cloud-download" />
            </b-button>
            <h6 class="mb-0" title="Publish this dataset to the filter store, or download for processing elsewhere" v-b-tooltip.hover>
                Publish Dataset
            </h6>
        </template>
        <div class="operation-wrapper">
            <b-input-group prepend="Dataset Name" size="sm">
                <b-form-input type="text" v-model="publishName" :disabled="!publishDataset" :debounce="300" />
                <b-input-group-append is-text>
                    <b-form-checkbox switch v-model="publishDataset" title="Publish this dataset to the filter store" v-b-tooltip.hover />
                </b-input-group-append>
            </b-input-group>
        </div>
    </b-card>
</template>

<script lang="ts">
import { remote } from 'electron';
import Vue, { PropType } from 'vue';
import {tsvFormat, csvFormat} from 'd3-dsv';
import path from 'path';
import fs from 'fs';
import { SaveCancelledError } from '@/components/Core/IO/types';
import { showSaveErrorToast, showSaveSuccessToast } from '@/components/Core/IO/Toasts';


export default Vue.extend({
    props: {
        Dataset: {
            required: true,
        },
        Source: {
            type: String,
            required: true,
        },
        Owner: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            publishDataset: false,
            publishName: 'Query Result',
        };
    },
    watch: {
        Dataset: {
            handler() {
                if (this.publishDataset) {
                    this.publishDatasetToStore();
                }
            },
        },
        publishDataset: {
            handler() {
                if (this.publishDataset) {
                    this.publishDatasetToStore();
                } else {
                    this.unpublishDatasetFromStore();
                }
            }
        },
        publishName: {
            handler(newValue, oldValue) {
                this.unpublishDatasetFromStore(oldValue);
                this.publishDatasetToStore(newValue);
            }
        },
    },
    methods: {
        publishDatasetToStore(name?) {
            if (this.publishDataset) {
                this.$store.commit(`${this.Source}/publishDataset`, {
                    owner: this.Owner,
                    name: name || this.publishName,
                    data: this.Dataset,
                });
            }
        },
        unpublishDatasetFromStore(name?) {
            this.$store.commit(`${this.Source}/unpublishDataset`, {
                owner: this.Owner,
                name: name || this.publishName,
            });
        },
        getAllowedFormatsForData() {
            const options = [
                { name: 'JSON', extensions: ['json']},
            ];
            if (Array.isArray(this.Dataset)) {
                options.push(...[
                    { name: 'Comma Separated Values', extensions: ['csv']},
                    { name: 'Tab Separated Values', extensions: ['tsv']},
                ]);
            }
            options.push({ name: 'All Files', extensions: ['*']});
            return options;
        },
        downloadData() {
            Promise.resolve()
                .then(() => {
                    const dest = remote.dialog.showSaveDialogSync({
                        title: 'Save Snapshot',
                        defaultPath: `${this.publishName}.json`,
                        filters: this.getAllowedFormatsForData(),
                    });
                    if (dest === undefined) {
                        throw new SaveCancelledError();
                    }
                    return {
                        dest,
                    };
                })
                .then((rslt) => {
                    let data;
                    switch (path.extname(rslt.dest)) {
                        case '.tsv':
                            data = tsvFormat(this.Dataset as object[]);
                            break;
                        case '.csv':
                            data = csvFormat(this.Dataset as object[]);
                            break;
                        case '.json':
                        default:
                            data = JSON.stringify(this.Dataset);
                            break;
                    }
                    return {
                        dest: rslt.dest,
                        data,
                    };
                })
                .then((rslt) => {
                    return new Promise((resolve, reject) => {
                        fs.writeFile(rslt.dest, rslt.data, (err) => {
                            if (err) {
                                reject(err);
                            }
                            resolve(rslt.dest);
                        });
                    });
                })
                .then((dest) => showSaveSuccessToast(dest as string, 'dataset'))
                .catch((err) => {
                    if (err instanceof SaveCancelledError) {
                        return; // don't care the user cancelled of their own accord
                    }
                    showSaveErrorToast(err, 'dataset');
                });
        },
    },
});
</script>

<style scoped>
.download-button {
    padding: 0;
}
input {
    height: calc(1.5em + 0.75rem + 2px) !important;
}
</style>