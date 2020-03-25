
export function getModuleNamespace(store: any, state) {
    const moduleNamespace = Object.keys(store._modulesNamespaceMap)
        .find((path) => store._modulesNamespaceMap[path].context.state === state);
    if (typeof moduleNamespace === 'string') {
        return moduleNamespace.slice(0, -1);
    }
}
