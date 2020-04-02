
export function getModuleNamespace(store: any, state) {
    const moduleNamespace = Object.keys(store._modulesNamespaceMap)
        .find((path) => store._modulesNamespaceMap[path].context.state === state);
    if (typeof moduleNamespace === 'string') {
        return moduleNamespace.slice(0, -1);
    }
}

export function unnest(theObject: object, path: string, separator: string = '/'): any {
    try {
        return path.replace('[', separator).replace(']', '')
                   .split(separator)
                   .reduce((obj, property) => obj[property], theObject);
    } catch (err) {
        return undefined;
    }
}
