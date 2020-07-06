import { toPng, toSvgDataURL } from 'html-to-image';
import { svgAsDataUri, svgAsPngUri } from 'save-svg-as-png';
import { Store } from 'vuex';
import { unnest } from '@/util/Vuex';
import app from '@/main';
import { remote, shell } from 'electron';
import fs from 'fs';
import mime from 'mime-types';
import { DataWindowState } from '@/store/datawindow.types';


interface SnapshotOptions {
    format: string;
    quality: number;
    scale: number;
    backgroundColor: string;
}

export function defaultOptions(target: Vue): SnapshotOptions {
    const rtgt = resolveTarget(target);
    return {
        format: rtgt.type === 'video' ? 'video' : 'png',
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
            const dfltPath = getSuggestedFilename(target) || basename;
            const dest = remote.dialog.showSaveDialogSync({
                title: 'Save Snapshot',
                defaultPath: `${dfltPath}.${finfo.extension}`,
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
        .then((dest) => showSuccessToast(dest as string))
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

export async function SnapshotWorkspace() {
    const opts = defaultOptions(app);

    const toSnapshot = getAllVues(app).filter((v) => {
        if (v.$parent && v.$parent.$parent) {
            return (v.$parent.$parent.$options as any)._componentTag === 'JqxWindow';
        }
    });

    if (toSnapshot.length <= 0) {
        app.$bvToast.toast('There are not any items to snapshot!', {
            title: 'Error Creating Workspace Snapshot!',
            variant: 'danger',
            toaster: 'b-toaster-bottom-right',
        });
        return;
    }

    const dims = toSnapshot.reduce((accum, item) => {
        const wstate = (item as any).$wstate as DataWindowState;
        accum.minX = Math.min(accum.minX, wstate.pos_x);
        accum.maxX = Math.max(accum.maxX, wstate.pos_x + wstate.width);
        accum.minY = Math.min(accum.minY, wstate.pos_y);
        accum.maxY = Math.max(accum.maxY, wstate.pos_y + wstate.height);
        return accum;
    }, {
        minX: Number.MAX_VALUE,
        maxX: Number.MIN_VALUE,
        minY: Number.MAX_VALUE,
        maxY: Number.MIN_VALUE,
    });

    const canvas = document.createElement('canvas');
    canvas.style.width = `${dims.maxX * opts.scale}px`;
    canvas.style.height = `${dims.maxY * opts.scale}px`;
    canvas.width = dims.maxX * opts.scale;
    canvas.height = dims.maxY * opts.scale;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const drawers = toSnapshot.map((item) => {
        return targetToDataURI(item, opts)
        .then((data) => {
            return new Promise((resolve, reject) => {
                const subInfo = dataUriToFile(data as string)
                if (subInfo.extension !== 'png') {
                    reject('non-image data');
                    return;
                }
                const wstate = (item as any).$wstate as DataWindowState;
                const img = new Image();
                img.onload = () => {
                    if (ctx === null) {
                        return reject('no context!');
                    }
                    const isNotScaled = img.width / opts.scale / wstate.width < 1;
                    if (isNotScaled) {
                        ctx.drawImage(img,
                            wstate.pos_x * opts.scale, wstate.pos_y * opts.scale,
                            img.width * opts.scale, img.height * opts.scale);
                    } else {
                        ctx.drawImage(img,
                            wstate.pos_x * opts.scale, wstate.pos_y * opts.scale,
                            img.width, img.height);
                    }
                    resolve();
                };
                img.src = data as string;
            });
        });
    });
    Promise.allSettled(drawers)
        .then(() => {
            const finfo = dataUriToFile(canvas.toDataURL('image/png'));
            document.body.removeChild(canvas);
            return finfo;
        })
        .then((finfo) => {
            const dest = remote.dialog.showSaveDialogSync({
                title: 'Save Snapshot',
                defaultPath: 'WorkspaceSnapshot.png',
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
        .then((dest) => showSuccessToast(dest as string))
        .catch((err) => {
            if (err instanceof SaveCancelledError) {
                return; // don't care the user cancelled of their own accord
            }
            app.$bvToast.toast(err.toString(), {
                title: 'Error Creating Workspace Snapshot!',
                variant: 'danger',
                toaster: 'b-toaster-bottom-right',
            });
        });
}

function getAllVues(root: Vue) {
    const items = [root];
    items.push(...root.$children.flatMap((child) => getAllVues(child)));
    return items;
}

function showSuccessToast(dest: string, showOrOpen: 'open'|'show' = 'open') {
    const h = app.$createElement;

    let clickHandler;
    if (showOrOpen === 'show') {
        clickHandler = () => shell.showItemInFolder(dest);
    } else {
        clickHandler = () => shell.openItem(dest);
    }

    const body = [
        h('div', {}, [
            'Your snapshot was saved successfully to ',
            h('a', {
                attrs: { href: 'javascript:void(0)', title: 'Click to open' },
                on: { click: clickHandler, },
            }, dest)
        ]),
    ];

    app.$bvToast.toast(body, {
        title: 'Snapshot Success!',
        variant: 'success',
        toaster: 'b-toaster-bottom-right',
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

export function resolveTarget(target: Vue): {type: 'video'|'svg'|'html', target:HTMLElement} {
    const eattr = '[data-snapshot-target]';

    const explicit = (target.$el.hasAttribute(eattr)
        ? target.$el
        : target.$el.querySelector('[data-snapshot-target]')) as HTMLElement;
    if (explicit !== null) {
        const etag = explicit.tagName;
        if (etag === 'svg') {
            return {
                type: 'svg',
                target: explicit,
            };
        } else if (etag === 'video') {
            return {
                type: 'video',
                target: explicit,
            }
        } else {
            return {
                type: 'html',
                target: explicit,
            }
        }
    }

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
        return src.replace(/[\#\?].*$/,'').replace(/\.[^/.]+$/, '');
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
        uri = videoToDataUri(tgt.target as HTMLVideoElement, options);
    }
    return uri;
}


async function videoToDataUri(el: HTMLVideoElement, options: SnapshotOptions) {
    if (options.format === 'video') {
        return await fetch(el.src)
            .then(async (response) => {
                const blob = await response.blob();
                const data = new Uint8Array(await blob.arrayBuffer());
                const mimeType = mime.lookup(el.src);

                return `data:${mimeType};base64,${encode(data)}`;
            });
    } else {
        const canvas = document.createElement('canvas');
        canvas.style.width = `${el.width}px`;
        canvas.style.height = `${el.height}px`;
        canvas.width = el.width;
        canvas.height = el.height;
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        if (ctx === null) {
            throw new Error('got null canvas context!');
        }
        ctx.drawImage(el, 0, 0, el.width, el.height);
        const data = canvas.toDataURL('image/png');
        document.body.removeChild(canvas);
        return data;
    }
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
