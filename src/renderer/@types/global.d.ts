export { };

import { IMenuAPI } from "@electron/shared/menuAPI";

declare global {
    interface Window {
        electronAPI: {
            getNodeProcess: () => {
                versions: NodeJS.ProcessVersions;
                platform: string;
                env: NodeJS.ProcessEnv;
            };
            sendToMain: (channel: string, data: any) => void;
            receiveFromMain: (channel: string, func: (...args: any[]) => void) => void;
        };
        menuAPI: IMenuAPI
    }
}
