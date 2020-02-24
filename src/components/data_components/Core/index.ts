// Globally register all base components for convenience, because they
// will be used very frequently. Components are registered using the
// PascalCased version of their file name.

import Vue from 'vue';
import store from '@/store/root.store';
import {ComponentRegistration} from '@/store/root.types';


export function DiscoverDataComponents() {
    // https://webpack.js.org/guides/dependency-management/#require-context
    const requireComponent = require.context(
        '@/components/data_components', // Look for files in the current directory
        true, // Do look in subdirectories
        /[\w-]+\.vue$/, // Only include "_base-" prefixed .vue files
    );

    // For each matching file name...
    requireComponent.keys().forEach((fileName) => {
        // Get the component config
        const componentConfig = requireComponent(fileName);
        // Get the PascalCase version of the component name
        const componentName = fileName
            .replace(/^\.\//, '')       // Remove the "./" from the beginning
            .replace(/[\w-]+\//, '')    // remove sub-directory names
            .replace(/\.\w+$/, '')      // Remove the file extension from the end
            .split('-')                 // Split up kebabs
            .map((kebab) => kebab.charAt(0).toUpperCase() + kebab.slice(1)) // Upper case
            .join('');                  // Concatenated

        // Globally register the component
        Vue.component(componentName, componentConfig.default || componentConfig);
    });
}
DiscoverDataComponents();


export default function RegisterDataComponent(meta: ComponentRegistration) {
    store.commit('registerComponent', meta);
}
