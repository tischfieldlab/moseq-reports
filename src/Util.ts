

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

export function transpose(data: number[][]): number[][] {
    return data[0].map((col, i) => data.map((row) => row[i]));
}

export declare type Procedure = (...args: any[]) => void;
export function throttled<F extends Procedure>(delay: number, fn: F) {
    let lastCall = 0;
    return (...args) => {
        const now = new Date().getTime();
        if (now - lastCall < delay) {
            return;
        }
        lastCall = now;
        return fn(...args);
    };
}
