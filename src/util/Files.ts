import fs from 'fs';
import pth from 'path';

export function saveFile(name: string, type: string, data: string) {
    if (data != null && navigator.msSaveBlob) {
        return navigator.msSaveBlob(new Blob([data], { type }), name);
    }

    const a = document.createElement('a');
    a.setAttribute('style', 'display: none;');
    const url = window.URL.createObjectURL(new Blob([data], { type }));
    a.setAttribute('href', url);
    a.setAttribute('download', name);
    document.body.append(a);
    a.click();
    setTimeout(() => {  // fixes firefox html removal bug
        window.URL.revokeObjectURL(url);
        a.remove();
    }, 500);
}

export function deleteFolderRecursive(path: string) {
    let files = Array<string>();
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
            const curPath = pth.join(path, file);
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

/*
async function ExtractDirectory(zip: StreamZip, dirname: string|null, basedest: string): Promise<object> {
    let dest: string;
    if (dirname !== null) {
        dest = path.join(basedest, dirname);
        fs.mkdirSync(dest);
    } else {
        dest = basedest;
    }
    return new Promise((resolve, reject) => {
        zip.extract(dirname as string, dest, (err) => {
            if (err !== null) {
                reject(err);
            }
            resolve({});
        });
    });
}
async function jsonParseZipEntryContainingNaN(zip: StreamZip, entryName: string) {
    try {
        const entry = zip.entryDataSync(entryName);
        return Promise.resolve(JSON.parse(entry.toString().replace(/\bNaN\b/g, '"***NaN***"'), (key, value) => {
                    return value === '***NaN***' ? NaN : value;
                }));
    } catch (e) {
        return Promise.reject(new Error(`Entry ${entryName} is missing from data file!`));
    }
}
*/
