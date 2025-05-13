<template>
    <b-card no-body>
      <template #header>
        <b-button
          @click="downloadData"
          title="Download Result"
          v-b-tooltip.hover
          variant="link"
          class="float-right download-button"
        >
          <b-icon icon="cloud-download" />
        </b-button>
        <h6
          class="mb-0"
          title="Publish this dataset to the filter store, or download for processing elsewhere"
          v-b-tooltip.hover
        >
          Publish Dataset
        </h6>
      </template>
      <div class="operation-wrapper">
        <b-input-group prepend="Dataset Name" size="sm">
          <b-form-input
            type="text"
            v-model="publishName"
            :disabled="!publishDataset"
            :debounce="300"
          />
          <b-input-group-append is-text>
            <b-form-checkbox
              switch
              v-model="publishDataset"
              title="Publish this dataset to the filter store"
              v-b-tooltip.hover
            />
          </b-input-group-append>
        </b-input-group>
      </div>
    </b-card>
  </template>
  
<script>
import { ref, watch, onUnmounted } from 'vue';
import { tsvFormat, csvFormat } from 'd3-dsv';
import { showSaveErrorToast, showSaveSuccessToast } from '@render/components/Core/IO/Toasts';
import { useDataViewStore } from '@store/dataview.store';

export default {
    name: 'DatasetPublisher',
    props: {
        Dataset: {
            type: Array,
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
    setup(props) {
        const dataviewStore = useDataViewStore(props.Source);
        const publishDataset = ref(false);
        const publishName = ref('Query Result');
    
        const publishDatasetToStore = (name = publishName.value) => {
            if (publishDataset.value) {
                dataviewStore.publishDataset({
                    owner: props.Owner,
                    name,
                    data: props.Dataset,
                });
            }
        };

        const unpublishDatasetFromStore = (name = publishName.value) => {
            dataviewStore.unpublishDataset({
                owner: props.Owner,
                name,
            });
        };

        const getAllowedFormatsForData = () => {
            const options = [{ name: 'JSON', extensions: ['json'] }];
            if (Array.isArray(props.Dataset)) {
                options.push(
                    { name: 'Comma Separated Values', extensions: ['csv'] },
                    { name: 'Tab Separated Values', extensions: ['tsv'] }
                );
            }
            options.push({ name: 'All Files', extensions: ['*'] });
            return options;
        };

        const downloadData = async () => {
            try {
                const { filePath } = await window.electron.showSaveDialog({
                    title: 'Save Snapshot',
                    defaultPath: `${publishName.value}.json`,
                    filters: getAllowedFormatsForData(),
                });

                if (!filePath) {
                    throw new Error('Save cancelled');
                }

                let data;
                switch (filePath.split('.').pop()) {
                    case 'tsv':
                        data = tsvFormat(props.Dataset);
                        break;
                    case 'csv':
                        data = csvFormat(props.Dataset);
                        break;
                    case 'json':
                    default:
                        data = JSON.stringify(props.Dataset);
                        break;
                }

                await window.electron.writeFile(filePath, data);
                showSaveSuccessToast(filePath, 'dataset');
            } catch (err) {
                if (err.message !== 'Save cancelled') {
                    showSaveErrorToast(err, 'dataset');
                }
            }
        };

        watch(
            () => props.Dataset,
            () => {
                if (publishDataset.value) {
                    publishDatasetToStore();
                }
            }
        );

        watch(publishDataset, (newVal) => {
            if (newVal) {
                publishDatasetToStore();
            } else {
                unpublishDatasetFromStore();
            }
        });

        watch(publishName, (newVal, oldVal) => {
            unpublishDatasetFromStore(oldVal);
            publishDatasetToStore(newVal);
        });

        onUnmounted(() => {
            unpublishDatasetFromStore();
        });

        return {
            publishDataset,
            publishName,
            downloadData,
        };
    },
};
</script>

<style scoped>
.download-button {
    padding: 0;
}
input {
    height: calc(1.5em + 0.75rem + 2px) !important;
}
</style>
