import { defineConfig, defineConfigWithTheme } from 'vitepress';
import { SearchPlugin } from "vitepress-plugin-search";
import lightbox from "vitepress-plugin-lightbox"
import {homepage} from '../../../package.json';



export default defineConfig({
    vite: {
        plugins: [
            SearchPlugin({})
        ],
    },

    // site-level options
    title: 'moseq-reports',
    titleTemplate: 'moseq-reports .::. :title',
    description: 'Just playing around.',
    lang: 'en-US',
    base: '/moseq-reports/',
    srcDir: './src/',
    ignoreDeadLinks: true,

    themeConfig: {
        // theme-level options
        logo: '/winapp256x256.svg',

        socialLinks: [
            { icon: 'github', link: homepage },
        ],

        sidebar: [
            {
                text: 'User Guide',
                items: [
                    { text: 'About', link: '/About' },
                    { text: 'Installation', link: '/Installation' },
                    { text: 'Getting Started', link: '/UsingMoseq' },
                    { text: 'Tool Library', link: '/Tools' },
                ],
            }
        ],
    },
    markdown: {
        config: (md) => {
            // Use lightbox plugin
            md.use(lightbox, {});
        },
    },
});