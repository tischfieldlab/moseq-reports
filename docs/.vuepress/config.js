const { auto } = require("@popperjs/core");
const path = require("path");
const fs = require("fs");
const {version} = require('../../package.json');

module.exports = {
  title: 'Moseq Reports',
  base: '/moseq-reports/',
  theme: "craftdocs",
  plugins: [['vuepress-plugin-global-variables', { variables: { appVersion: version } }]],
  chainWebpack: config => {
    config.resolve.alias.set('@img', path.resolve(__dirname, "../user_guide/Images"))
  },
  /*
  versions: [
    ["3.x", { label: "3.x" }],
    ["2.x", { label: "2.x" }]
  ],
  defaultVersion: "3.x",
  */
  themeConfig: {
    head: [
      ['link', { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png"}],
      ['link', { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png"}],
      ['link', { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png"}],
      ['link', { rel: "manifest", href: "/site.webmanifest"}],
      ['link', { rel: "mask-icon", href: "/safari-pinned-tab.svg", color: "#3a0839"}],
      ['link', { rel: "shortcut icon", href: "/favicon.ico?"}]
    ],
    nav: [
      { text: 'Github', link: 'https://github.com/tischfieldlab/moseq-reports' },
      { text: 'Abraira Lab', link: 'https://www.abrairalab.org/' }
    ],
    sidebar: [{
        title: 'User Guide',
        sidebarDepth: 1,
        collapsable: false,
        children: [
          '/user_guide/About.md',
          '/user_guide/Installation.md',
          '/user_guide/GettingStarted.md',
          '/user_guide/Tools.md',
          '/user_guide/DeveloperGuide.md',
          '/user_guide/Components.md',
        ]
      },
      /*{
        title: 'Component Documentation',
        sidebarDepth: 0,
        children: fs.readdirSync('docs/components').map((path) => { console.log(path); return "/components/" + path.replace('.md', '') })
      },*/
    ],
    /*{
      '/user_guide/': [
        '',
        'About',
        'Installation',
        'GettingStarted',
        'Tools'
      ],

      
      '/components/': [
        '',
        'AggregateOperation'
      ],
    },*/

    

    codeLanguages: {
      php: "PHP",
      twig: "Twig",
      // any other code language labels you want to include in code toggles...
    },
  },
  markdown: {
    anchor: { level: [2, 3] },
    extendMarkdown(md) {
      let markup = require("vuepress-theme-craftdocs/markup");
      md.use(markup);
    },
  },
}
  