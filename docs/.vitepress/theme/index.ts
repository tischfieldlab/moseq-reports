import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import Layout from "./Layout.vue";
import { redirects } from './redirects';
import { withBase } from 'vitepress'



export default {
    extends: DefaultTheme,
    Layout,
    enhanceApp({ app, router, siteData }) {

        // handle redirects
        router.onBeforeRouteChange = (to: string) => {
            const path = to.replace(/\.html$/i, '').replace(siteData.value.base, '/'),
                toPath = redirects[path];

            if (toPath) {
                setTimeout(() => { router.go(withBase(toPath)); })
                return false;
            } else {
                return true;
            }
        }
    }
} satisfies Theme;
