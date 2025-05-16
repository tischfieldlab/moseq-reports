import { PromiseWithToast, ToastOrchestratorCreateParam, useToastController } from "bootstrap-vue-next";
import { App, Plugin } from "vue";

export const ToastPlugin: Plugin = {
    install: (app: App, options: any) => {
        
        // inject a globally available $showToast() method
        app.config.globalProperties.$showToast = (params: ToastOrchestratorCreateParam): PromiseWithToast => {
            return app.runWithContext(() => {
                const {create} = useToastController()
                return create(params);
            });
        }
    }
}

declare module "@vue/runtime-core" {
    //Bind to `this` keyword
    interface ComponentCustomProperties {
        $showToast: (params: ToastOrchestratorCreateParam) => PromiseWithToast;
    }
}