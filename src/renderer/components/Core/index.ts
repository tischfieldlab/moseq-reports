import { App } from "vue";
import store from "@render/store/root.store";
import { ComponentRegistration } from "@render/store/root.types";

export function DiscoverDataComponents(app: App) {
  // Register core components
  GlobalRegisterVueComponents(
    app,
    import.meta.glob("@render/components/Core/**/*.vue", { eager: true })
  );

  // Register data components
  GlobalRegisterVueComponents(
    app,
    import.meta.glob("@render/components/DataComponents/**/*.vue", { eager: true })
  );
}


function GlobalRegisterVueComponents(app: App, components: Record<string, any>) {
  Object.entries(components).forEach(([path, componentConfig]) => {
    // Get the PascalCase name of the component
    const componentName = path
      .replace(/^.*[\\/]/, "") // Remove all directories
      .replace(/\.\w+$/, "") // Remove the file extension
      .split("-") // Split kebab-case
      .map((kebab) => kebab.charAt(0).toUpperCase() + kebab.slice(1)) // Convert to PascalCase
      .join("");

    // Register the component globally
    app.component(componentName, componentConfig.default || componentConfig);
  });
}

export default function RegisterDataComponent(meta: ComponentRegistration) {
  store.commit("registerComponent", meta);

}
