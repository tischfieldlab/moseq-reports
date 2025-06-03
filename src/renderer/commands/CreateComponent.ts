import { MenuComponentRegistration } from "@main/shared/menuAPI";
import { componentRegistry } from "@render/store/component_registry.store";
import { useWindowsStore } from "@render/store/windows.store";


export default function CreateComponent(component: MenuComponentRegistration) {
    const spec = componentRegistry.getSpecification(component.component_type);
    const windowsStore = useWindowsStore();
    windowsStore.createWindow(spec);
};
