import { App } from "vue";
import store from "@render/store/root.store";
import { ComponentRegistration } from "@render/store/root.types";

export function DiscoverDataComponents(app: App) {
  GlobalRegisterVueComponents(
    app,
    import.meta.glob("@render/components/Core/**/*.vue", { eager: true })
  );

  GlobalRegisterVueComponents(
    app,
    import.meta.glob("@render/components/DataComponents/**/*.vue", { eager: true })
  );
}


function GlobalRegisterVueComponents(app: App, components: Record<string, any>) {
  Object.entries(components).forEach(([path, componentConfig]) => {
    const componentName = path
      .replace(/^.*[\\/]/, "") 
      .replace(/\.\w+$/, "") 
      .split("-") 
      .map((kebab) => kebab.charAt(0).toUpperCase() + kebab.slice(1)) 
      .join("");
    app.component(componentName, componentConfig.default || componentConfig);
  });
}

export default function RegisterDataComponent(meta: ComponentRegistration) {
  store.commit("registerComponent", meta);

}
