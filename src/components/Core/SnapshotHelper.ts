import { toPng, toSvgDataURL } from 'html-to-image';
import { svgAsDataUri, svgAsPngUri } from 'save-svg-as-png';
import { Store } from 'vuex';
import { unnest } from '@/util/Vuex';
import app from '@/main';
import { remote } from 'electron';
import fs from 'fs';
import mime from 'mime-types';


interface SnapshotOptions {
    format: string;
    quality: number;
    scale: number;
    backgroundColor: string;
}

export function defaultOptions(target: Vue): SnapshotOptions {
    return {
        format: 'png',
        quality: 1,
        scale: 4,
        backgroundColor: '#FFFFFF00', // fully transparent white
    };
}

export function ensureDefaults(target: Vue, store: Store<any>) {
    const id = target.$props.id;
    const settings = unnest(store.state, id).settings;
    if (settings.snapshot === undefined) {
        store.commit(`${id}/updateComponentSettings`, {
            id,
            settings: {
                snapshot: { ...defaultOptions(target) },
            },
        });
    }
}

export default async function Snapshot(target: Vue, basename: string, options: SnapshotOptions) {
    return targetToDataURI(target, options)
        .then((data) => dataUriToFile(data as string))
        .then((finfo) => {
            const dfltPath = getSuggestedFilename(target) || `${basename}.${finfo.extension}`;
            const dest = remote.dialog.showSaveDialogSync({
                title: 'Save Snapshot',
                defaultPath: dfltPath,
                filters: filtersForFinfo(finfo),
            });
            if (dest === undefined) {
               throw new SaveCancelledError();
            }
            return {
                finfo,
                dest
            };
        })
        .then((data) => {
            return new Promise((resolve, reject) => {
                fs.writeFile(data.dest, data.finfo.buffer, (err) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(data.dest);
                });
            });
        })
        .then((dest) => {
            app.$bvToast.toast(`Your snapshot was saved successfully to: ${dest}.`, {
                title: 'Snapshot Success!',
                variant: 'success',
                toaster: 'b-toaster-bottom-right',
            });
        })
        .catch((err) => {
            if (err instanceof SaveCancelledError) {
                return; // don't care the user cancelled of their own accord
            }
            app.$bvToast.toast(err.toString(), {
                title: 'Error Creating Snapshot!',
                variant: 'danger',
                toaster: 'b-toaster-bottom-right',
            });
        });
}

function filtersForFinfo(finfo) {
    const infos = [] as any[];
    if (finfo.extension === 'png') {
        infos.push({ name: 'Image Files', extensions: ['png']});
    }
    if (finfo.extension === 'svg') {
        infos.push({ name: 'Image Files', extensions: ['svg']});
    }
    if (finfo.extension === 'mp4') {
        infos.push({ name: 'Movie Files', extensions: ['mp4']});
    }
    infos.push({ name: 'All Files', extensions: ['*']});
    return infos;
}

function resolveTarget(target: Vue): {type: 'video'|'svg'|'html', target:HTMLElement} {
    const svg = findTag(target, 'svg');
    if (svg) {
        return {
            type: 'svg',
            target: svg,
        }
    }

    const video = findTag(target, 'video');
    if (video) {
        return {
            type: 'video',
            target: video,
        }
    }

    return {
        type: 'html',
        target: target.$el as HTMLElement,
    };
}
function findTag(target: Vue, tag: string) {
    if (target.$el.tagName === tag) {
        return target.$el as HTMLElement;
    } else {
        return target.$el.getElementsByTagName(tag).item(0) as HTMLElement;
    }
}

function dataUriToFile(dataUri: string) {
    const matches = dataUri.match(/^data:([A-Za-z0-9-+\/]+);([A-Za-z0-9-]+),(.+)$/);
    if (matches === null || matches.length !== 4) {
        throw new Error('Invalid input string');
    }

    return {
        mimeType: matches[1],
        encoding: matches[2],
        extension: mime.extension(matches[1]),
        buffer: new Buffer(matches[3], 'base64'),
    };
}

function getSuggestedFilename(target: Vue) {
    const tgt = resolveTarget(target);
    if (tgt.type === 'video') {
        const src = decodeURIComponent((tgt.target as HTMLVideoElement).src);
        return src.replace(/[\#\?].*$/,'');
    }
    return undefined;
}

async function targetToDataURI(target: Vue, options: SnapshotOptions) {
    const tgt = resolveTarget(target);
    let uri: Promise<string>|undefined;
    if (tgt.type === 'html') {
        if (options.format === 'png') {
            uri = toPng(tgt.target, {
                quality: options.quality,
                backgroundColor: options.backgroundColor,
            });
        } else if (options.format === 'svg') {
            uri = toSvgDataURL(tgt.target, {
                quality: options.quality,
                backgroundColor: options.backgroundColor,
            });
        }
    } else if (tgt.type === 'svg') {
        if (options.format === 'png') {
            uri = svgAsPngUri(tgt.target, {
                scale: options.scale,
                encoderOptions: options.quality,
                backgroundColor: options.backgroundColor,
            });
        } else if (options.format === 'svg') {
            uri = svgAsDataUri(tgt.target, {
                scale: options.scale,
                encoderOptions: options.quality,
                backgroundColor: options.backgroundColor,
            });
        }
    } else if (tgt.type === 'video') {
        uri = videoToDataUri(tgt.target);
    }
    return uri;
}


async function videoToDataUri(el) {
    return await fetch(el.src)
        .then(async (response) => {
            const blob = await response.blob();
            const data = new Uint8Array(await blob.arrayBuffer());
            const mimeType = mime.lookup(el.src);

            return `data:${mimeType};base64,${encode(data)}`;
        });
}

// public method for encoding an Uint8Array to base64
function encode(input: ArrayBuffer): string {
    const keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    let chr1;
    let chr2;
    let chr3;
    let enc1;
    let enc2;
    let enc3;
    let enc4;
    let i = 0;

    while (i < input.byteLength) {
        chr1 = input[i++];
        chr2 = i < input.byteLength ? input[i++] : Number.NaN; // Not sure if the index
        chr3 = i < input.byteLength ? input[i++] : Number.NaN; // checks are needed here

        // tslint:disable-next-line:no-bitwise
        enc1 = chr1 >> 2;
        // tslint:disable-next-line:no-bitwise
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        // tslint:disable-next-line:no-bitwise
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        // tslint:disable-next-line:no-bitwise
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }
        output += keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                  keyStr.charAt(enc3) + keyStr.charAt(enc4);
    }
    return output;
}

class SaveCancelledError extends Error {}
