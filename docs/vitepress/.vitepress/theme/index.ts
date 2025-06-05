import DefaultTheme from 'vitepress/theme';
import {homepage, version} from '../../../../package.json';
import type { Theme } from 'vitepress';
import Layout from "./Layout.vue";



let COMMIT_REF = 'Commit Reference - Branch/Tag : ';
let COMMIT_HASH = 'Commit Hash - ';
try {
    const commitRefSplit = process.env.APP_COMMIT_REF && process.env.APP_COMMIT_REF.split("/");

    if (commitRefSplit){
        COMMIT_REF = COMMIT_REF + commitRefSplit[commitRefSplit.length - 1];
    }

    if(process.env.APP_COMMIT_HASH){
        COMMIT_HASH = COMMIT_HASH + process.env.APP_COMMIT_HASH;
    }
} catch (e) {
    // do nothing, this is just for the build
    COMMIT_REF = COMMIT_REF + 'unknown';
    COMMIT_HASH = COMMIT_HASH + 'unknown';
}


export default {
    extends: DefaultTheme,
    Layout,
    enhanceApp({ app }) {
        app.config.globalProperties.$COMMIT_REF = COMMIT_REF;
        app.config.globalProperties.$COMMIT_HASH = COMMIT_HASH;
        app.config.globalProperties.$APP_VERSION = version;
    }
} satisfies Theme;
