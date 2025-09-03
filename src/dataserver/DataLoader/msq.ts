import path from "path";
import StreamZip from "node-stream-zip";
import { JsonDecoderWithNaNSupport } from "./JsonDecoder";
import { csvParse, tsvParse } from "d3-dsv";
import { autoType } from "./util";

interface MSQMetadata {
    manifest: object;
    groups: [string];
    label_map: [{ raw: number, usage: number, frames: number }];
}

class MSQFile {
    private filePath: string;
    private name: string;
    private zip: StreamZip | null = null;
    private zipEntries: { [name: string]: StreamZip.ZipEntry} = {};
    private sharedBuffers: { [name: string]: SharedArrayBuffer } = {};
    private metadata: MSQMetadata | null = null;

    private constructor(filePath: string) {
        this.filePath = path.normalize(filePath);
        this.name = path.basename(this.filePath, '.msq');
    }

    public getFilePath(): string {
        return this.filePath;
    }

    public async initialize(): Promise<void> {
        this.zipEntries = await new Promise((resolve, reject) => {
            try {
                this.zip = new StreamZip({ file: this.filePath, storeEntries: true });
                this.zip.on('error', reject);
                this.zip.on('ready', () => {
                    try {
                        if (this.zip === null) {
                            reject(new Error("Zip file is not initialized."));
                        } else {
                            resolve(this.zip.entries());
                        }
                    } catch (e) {
                        reject(e);
                    } finally {
                        if (this.zip !== null) {
                            this.zip.close();
                        }
                    }
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    public LoadMetadataData(): MSQMetadata {
        if (this.metadata == null) {
            this.metadata =  {
                manifest: this.parseEntry('manifest.json'),
                groups: this.parseEntry('groups.json'),
                label_map: this.parseEntry('label_map.json'),
            };
        }
        return this.metadata;
    }

    public fileExists(entryName: string): boolean {
        if (this.zip === null) {
            throw new Error("Zip file is not initialized.");
        }
        return this.zipEntries.hasOwnProperty(entryName);
    }

    public loadEntry(entryName: string): Buffer {
        if (this.zip === null) {
            throw new Error("Zip file is not initialized.");
        }

        const entry = this.zipEntries[entryName];
        if (!entry) {
            throw new Error(`Entry ${entryName} is missing from the MSQ file!`);
        }

        const buffer = this.zip.entryDataSync(entryName);
        const sharedBuffer = new SharedArrayBuffer(buffer.length);
        const view = new Uint8Array(sharedBuffer);
        view.set(new Uint8Array(buffer));
        return this.zip.entryDataSync(entryName);
    }

    public parseEntry(entryName: string) {
        const data = this.loadEntry(entryName);
        const parser = this.getParser(entryName);
        return parser(data);
    }

    protected getParser(filename): (data: Buffer) => any {
        const ext = filename.split(".").pop();
        switch (ext) {
            case "json":
                return (data) => {
                    const decoder = new JsonDecoderWithNaNSupport();
                    return decoder.read(data) as any;
                };
            case "tsv":
                return (data) => tsvParse(data.toString(), autoType);
            case "csv":
                return (data) => csvParse(data.toString(), autoType);
            default:
                return (data) => data;
        }
    }

    public toString(): string {
        return `MSQFile: ${this.filePath}`;
    }

    static async load(filePath: string): Promise<MSQFile> {
        const msq = new MSQFile(filePath);
        msq.initialize();
        return msq;
    }
}