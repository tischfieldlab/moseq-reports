import { defineConfig } from 'vitepress';
import lightbox from "vitepress-plugin-lightbox"
import {homepage} from '../../package.json';



export default defineConfig({
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
    //ignoreDeadLinks: true,
    lastUpdated: true,

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
                    { text: 'Protocols', items: [
                        { text: 'Syllable Annotation', link: '/SyllableAnnotation' },
                    ]},
                ],
            }, {
                text: 'Developer Guide',
                items: [
                    { text: 'Getting Started', link: '/dev_guide/GettingStarted' },
                    { text: 'Data Components', link: '/dev_guide/DataComponents' },
                    { text: 'MSQ Internals', link: '/dev_guide/MSQInternals' },
                ],
            },
        ],

        search: {
            provider: 'local',
        },

        footer: {
            message: 'Released under the A License.',  // to-do: change this to the license you want
            copyright: 'Copyright © 2019-present, Tischfield Lab and Abraira Lab'
        }
    },
    markdown: {
        config: (md) => {
            // Use lightbox plugin
            md.use(lightbox, {});
        },
    },
});