export function clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

export function isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
}

export function mergeDeep<T extends object>(target: T, ...sources: object[]): T {
    if (!sources.length) {
        return target;
    }
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject((source as any)[key])) {
                if (!(target as any)[key]) {
                    Object.assign(target, { [key]: {} });
                }
                mergeDeep((target as any)[key], (source as any)[key]);
            } else {
                Object.assign(target, { [key]: (source as any)[key] });
            }
        }
    }

    return mergeDeep(target, ...sources);
}
