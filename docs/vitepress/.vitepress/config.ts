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

    head: [
        ['link', { rel: 'icon', href: '/moseq-reports/favicon.ico' }]
    ],

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
        logo: {
            dark: '/winapp256x256.dark.svg',
            light: '/winapp256x256.svg',
            alt: 'Moseq Reports Logo',
        },

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
                    { text: 'Syllable Annotation', link: '/SyllableAnnotation' },
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