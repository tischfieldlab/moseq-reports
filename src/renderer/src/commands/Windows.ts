import store from "../store/root.store";
import { ComponentRegistration } from "../store/root.types";

export function AvailableComponents() {
    return [...store.state.registry];
}

export function CreateComponent(component: ComponentRegistration) {
    store.dispatch("datawindows/createWindow", component);
}
