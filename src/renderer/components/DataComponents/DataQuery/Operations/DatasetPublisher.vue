<template>
    <BCard no-body>
        <template #header>
            <BButton @click="downloadData" title="Download Result" v-b-tooltip.hover variant="link"
                class="float-end download-button">
                <IBiCloudDownload />
            </BButton>
            <h6 class="mb-0" title="Publish this dataset to the filter store, or download for processing elsewhere"
                v-b-tooltip.hover>
                Publish Dataset
            </h6>
        </template>
        <div class="operation-wrapper">
            <BInputGroup prepend="Dataset Name" size="sm">
                <BFormInput type="text" v-model="publishName" :disabled="!publishDataset" :debounce="300" />
                <template #append>
                    <BInputGroupText>
                        <BFormCheckbox switch v-model="publishDataset" title="Publish this dataset to the filter store"
                            v-b-tooltip.hover />
                    </BInputGroupText>
                </template>
            </BInputGroup>
        </div>
    </BCard>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, defineComponent } from 'vue';
import { tsvFormat, csvFormat } from 'd3-dsv';
import { showSaveErrorToast, showSaveSuccessToast } from '@render/components/Core/IO/Toasts';
import { useDataViewStore } from '@store/dataview.store';
import { dialog } from '@electron/remote';
import fs from 'fs';
import { SaveCancelledError } from '@render/components/Core/IO/types';

const props = defineProps<{
    Dataset: any[] | undefined;
    Source: string;
    Owner: string;
}>();


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
    if (!props.Dataset) {
        console.error('No dataset to download');
        return;
    }
    try {
        const { filePath } = await dialog.showSaveDialog({
            title: 'Save Dataset',
            defaultPath: `${publishName.value}.json`,
            filters: getAllowedFormatsForData(),
        });

        if (!filePath) {
            throw new SaveCancelledError('Save cancelled');
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

        fs.writeFileSync(filePath, data)
        showSaveSuccessToast(filePath, 'dataset');
    } catch (err: unknown) {
        if (err instanceof SaveCancelledError) {
            console.log("save cancelled by user.");
            return;
        } else if (err instanceof Error) {
            console.error(err);
            showSaveErrorToast(err, 'dataset');
        } else {
            console.error("Unknown error", err);
            showSaveErrorToast(String(err), 'dataset');
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

</script>

<style scoped>
.download-button {
    padding: 0;
}

input {
    height: calc(1.5em + 0.75rem + 2px) !important;
}
</style>
