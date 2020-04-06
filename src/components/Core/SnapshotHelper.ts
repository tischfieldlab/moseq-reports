import { toPng, toSvgDataURL } from 'html-to-image';
import { saveAs } from 'file-saver';
import { svgAsDataUri, svgAsPngUri } from 'save-svg-as-png';
import { Store } from 'vuex';
import { unnest } from '@/util/Vuex';

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
    const svg = target.$el.getElementsByTagName('svg').item(0);
    let uri: Promise<string>|undefined;
    if (!svg) {
        if (options.format === 'png') {
            uri = toPng(target.$el as HTMLElement, {
                quality: options.quality,
                backgroundColor: options.backgroundColor,
            });
        } else if (options.format === 'svg') {
            uri = toSvgDataURL(target.$el as HTMLElement, {
                quality: options.quality,
                backgroundColor: options.backgroundColor,
            });
        }
    } else {
        if (options.format === 'png') {
            uri = svgAsPngUri(svg, {
                scale: options.scale,
                encoderOptions: options.quality,
                backgroundColor: options.backgroundColor,
            });
        } else if (options.format === 'svg') {
            uri = svgAsDataUri(svg, {
                scale: options.scale,
                encoderOptions: options.quality,
                backgroundColor: options.backgroundColor,
            });
        }
    }
    if (uri) {
        return uri.then((data) => saveAs(data, basename));
    }
    return null;
}
