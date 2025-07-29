import { defineLoader } from 'vitepress';
import * as child from "child_process";
import { version } from '../../../package.json';


export interface Data {
    commitRef: string;
    commitHash: string;
    appVersion: string;
}

declare const data: Data
export { data }



export default defineLoader({
    async load(): Promise<Data> {
        return {
            commitHash: child.execSync("git rev-parse --short HEAD").toString(),
            commitRef: process?.env?.VITE_APP_COMMIT_REF || "unknown",
            appVersion: version || "unknown"
        };
    }
})