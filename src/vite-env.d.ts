/// <reference types="vite/client" />

declare module '*.vue'{
  import type { DefineComponent } from "vue"
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vue'{
  import { createApp, defineComponent } from '@vue/runtime-dom'
  const Vue: typeof createApp
  export default Vue
  export * from '@vue/runtime-dom'
}

interface Window {
  // expose in the `electron/preload/index.ts` 
  ipcRenderer: import('electron').IpcRenderer 
}
