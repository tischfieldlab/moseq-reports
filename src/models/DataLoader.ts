// import StreamZip from 'node-stream-zip';
import DataModel, { MetadataJson } from './DataModel';


export default function LoadDataBundle(filename: string) {
    // console.log('attempting to open ', filename);
    const StreamZip = require('node-stream-zip');
    const zip = new StreamZip({
        file: filename,
        storeEntries: true,
        skipEntryNameValidation: false,
    });
    zip.on('error', (err) => {
        // tslint:disable-next-line:no-console
        console.log('zip error', err);
    });
    zip.on('ready', () => {
        // console.log('Entries read: ' + zip.entriesCount);
        // console.log('zip ready');
        LoadUsageData(zip);

        zip.close();
    });
}

function LoadSpinogramData(zip) {
    const data = zip.entryDataSync('spinogram.corpus-sorted-usage.json');
}

function LoadUsageData(zip) {
    const data = zip.entryDataSync('metadata.json');
    const content: MetadataJson = JSON.parse(data) as MetadataJson;
    DataModel.loadMetadataFile(content);
}
