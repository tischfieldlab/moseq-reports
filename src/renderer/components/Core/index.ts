import Vue from "vue";
import store from "@render/store/root.store";
import { ComponentRegistration } from "@render/store/root.types";

// TODO: Going to have to figure out how to get this to work...

// // Globally register all base components for convenience, because they
// // will be used very frequently. Components are registered using the
// // PascalCased version of their file name.
// export function DiscoverDataComponents() {
//   // register core components
//   GlobalRegisterVueComponents(
//     require.context(
//       "@/components/Core", // directory path
//       true, // Do look in subdirectories
//       /[\w-]+\.vue$/ // filename match pattern
//     )
//   );

//   // register data components
//   GlobalRegisterVueComponents(
//     require.context(
//       "@/components/data_components", // directory path
//       true, // Do look in subdirectories
//       /[\w-]+\.vue$/ // filename match pattern
//     )
//   );
// }
// DiscoverDataComponents();

// export default function RegisterDataComponent(meta: ComponentRegistration) {
//   store.commit("registerComponent", meta);
// }

// function GlobalRegisterVueComponents(requireComponent: __WebpackModuleApi.RequireContext) {
//   // https://webpack.js.org/guides/dependency-management/#require-context
//   // For each matching file name...
//   requireComponent.keys().forEach((fileName) => {
//     // Get the component config
//     const componentConfig = requireComponent(fileName);
//     // Get the PascalCase version of the component name
//     const componentName = fileName
//       .replace(/^\.\//, "") // Remove the "./" from the beginning
//       .replace(/[\w-]+\//g, "") // remove sub-directory names
//       .replace(/\.\w+$/, "") // Remove the file extension from the end
//       .split("-") // Split up kebabs
//       .map((kebab) => kebab.charAt(0).toUpperCase() + kebab.slice(1)) // Upper case
//       .join(""); // Concatenated

//     // Globally register the component
//     Vue.component(componentName, componentConfig.default || componentConfig);
//   });
// }
