import { Store } from 'vuex';
import { ComponentCustomProperties } from 'vue';
import { State } from '@render/store/root.store'; 

declare module '@vue/runtime-core' {

  interface ComponentCustomProperties {
    $store: Store<State>;
  }
}