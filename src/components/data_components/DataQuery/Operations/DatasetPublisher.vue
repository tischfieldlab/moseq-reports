<template>
    <b-card no-body>
        <template #header>
            <h6 class="mb-0">Publish Dataset</h6>
        </template>
        <div class="operation-wrapper">
            <b-input-group prepend="Dataset Name">
                <b-form-input type="text" v-model="publishName" :disabled="!publishDataset" :debounce="300" />
                <b-input-group-append is-text>
                    <b-form-checkbox switch v-model="publishDataset" title="Publish" />
                </b-input-group-append>
            </b-input-group>
        </div>
    </b-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';


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
    },
});
</script>