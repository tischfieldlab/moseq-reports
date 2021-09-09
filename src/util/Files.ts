import fs from 'fs';
import pth from 'path';

export function saveFile(name: string, type: string, data: string) {
    if (data != null && (navigator as any).msSaveBlob) {
        return (navigator as any).msSaveBlob(new Blob([data], { type }), name);
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
