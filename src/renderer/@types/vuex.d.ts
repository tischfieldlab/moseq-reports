import { Store } from 'vuex';
import { ComponentCustomProperties } from 'vue';
import { State } from '@render/store/root.store'; // Update the path to your Vuex state

declare module '@vue/runtime-core' {
  // Declare your own store states
  interface ComponentCustomProperties {
    $store: Store<State>;
  }
}