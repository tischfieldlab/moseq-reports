const { auto } = require("@popperjs/core");
const path = require("path");
const fs = require("fs");
const {version} = require('../../package.json');

const commitRefSplit = process.env.APP_COMMIT_REF && process.env.APP_COMMIT_REF.split("/");
let COMMIT_REF = '';
if (commitRefSplit){
  COMMIT_REF = "Commit Reference - Branch : " + commitRefSplit[commitRefSplit.length - 1];
}

let COMMIT_HASH = "Commit Hash - " + process.env.APP_COMMIT_HASH;

module.exports = {
  title: 'Moseq Reports',
  base: '/moseq-reports/',
  theme: "craftdocs",
  plugins: [['vuepress-plugin-global-variables', { variables: { appVersion: version, commitRef: COMMIT_REF, commitHash: COMMIT_HASH} }]],
  chainWebpack: config => {
    config.resolve.alias.set('@img', path.resolve(__dirname, "../Components/userDocs/Images"))
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
      ['link', { rel: "shortcut icon", href: "/favicon.ico"}]
    ],
    displayAllHeaders: true,
    nav: [
      { text: 'Github', link: 'https://github.com/tischfieldlab/moseq-reports' },
      { text: 'Abraira Lab', link: 'https://www.abrairalab.org/' }
    ],
    sidebar: [{
        title: 'User Guide',
        sidebarDepth: 1,
        collapsable: false,
        children: [
          '/Components/userDocs/About.md',
          '/Components/userDocs/Installation.md',
          '/Components/userDocs/GettingStarted.md',
          '/Components/userDocs/Tools.md',
          '/Components/userDocs/msq.md',
        ]
      },
      {
        title: 'Component Documentation',
        sidebarDepth: 0,
        children: fs.readdirSync('docs/Components/Vuese/components').map((path) => { console.log(path); return "/Components/Vuese/components/" + path.replace('.md', '') })
      },
    ],

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
  