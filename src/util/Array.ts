
export function transpose(data: number[][]): number[][] {
    return data[0].map((col, i) => data.map((row) => row[i]));
}
