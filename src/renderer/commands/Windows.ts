import store from "@render/store/root.store";
import { ComponentRegistration } from "@render/store/root.types";

export function AvailableComponents() {
  return [...store.state.registry];
}

export function CreateComponent(component: ComponentRegistration) {
  store.dispatch("datawindows/createWindow", component);
}
