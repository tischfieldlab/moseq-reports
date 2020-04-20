declare module 'node-stream-zip' {
    import { Stream } from 'stream';

    interface StreamZipOptions {
        /**
         * File to read
         */
        file: string,
        /**
         * You will be able to work with entries inside zip archive, 
         * otherwise the only way to access them is entry event
         * 
         * default: true
         */
        storeEntries?: boolean,
        /**
         * By default, entry name is checked for malicious characters, 
         * like ../ or c:\123, pass this flag to disable validation errors
         * 
         * default: false
         */
        skipEntryNameValidation?: boolean,
        /**
         * Undocumented adjustment of chunk size
         * 
         * default: automatic
         */
        chunkSize?: number
    }

    interface ZipEntry {
        name: string
        isDirectory: boolean
        isFile: boolean
        comment: string
        size: number
    }

    class StreamZip {
        constructor(config: StreamZipOptions);

        on(event: 'error', handler: (error: any) => void): void
        on(event: 'entry', handler: (entry: ZipEntry) => void): void
        on(event: 'ready', handler: () => void): void

        entry(entry: string): ZipEntry
        entries(): ZipEntry[]

        entriesCount: number
    
        stream(entry: string, callback: (err: any | null, stream?: Stream) =>void): void
        entryDataSync(entry: string): Buffer
        openEntry(entry: string, callback: (err: any | null, entry?: ZipEntry) => void, sync: boolean): void
        extract(entry: string, outPath: string, callback: (err?: any, count?: number) => void): void
        close(callback?: (err?: any) => void): void
    }
    export = StreamZip;
}