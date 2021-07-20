
export function transpose(data: Array<Array<number>>): Array<Array<number>> {
    return data[0].map((col, i) => data.map((row) => row[i]));
}

export function groupby<TItem>(data: Array<TItem>, fn: (item: TItem) => string, keys: Array<any> = []): {[key: string]: Array<TItem>} {
    return data.reduce((rv, item) => {
        (rv[fn(item)] = rv[fn(item)] || []).push(item);
        return rv;
    }, keys.reduce((rv, item) => {
        rv[item.toString()] = [];
        return rv;
    }, {}));
}

export function sample<TItem>(arr: Array<TItem>, size: number): Array<TItem> {
    const shuffled = arr.slice(0);
    let i = arr.length;
    const min = i - size;
    let temp: TItem;
    let index: number;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}
