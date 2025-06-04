const { auto } = require("@popperjs/core");
const path = require("path");
const fs = require("fs");
const {version} = require('../../package.json');

const commitRefSplit = process.env.APP_COMMIT_REF && process.env.APP_COMMIT_REF.split("/");
let COMMIT_REF = '';
if (commitRefSplit){
  COMMIT_REF = "Commit Reference - Branch/Tag : " + commitRefSplit[commitRefSplit.length - 1];
}

let COMMIT_HASH = '';
if(process.env.APP_COMMIT_HASH){
  COMMIT_HASH= "Commit Hash - " + process.env.APP_COMMIT_HASH;
}

const siteBase = "/moseq-reports"

function generateSidebar(folder){
  // Read folder and filter folders from markdown files
  let folderPath = folder.substring(folder.indexOf('/') + 1);
  let filePath = folderPath.substring(folderPath.indexOf('/'));
  //console.log(filePath);
  let paths = fs.readdirSync(folder);
  let files = paths.filter(path => path.includes(".md")).map((path) => {return folderPath + "/" + path.replace('.md', '')});
  let dirs = paths.filter(path => !path.includes(".")).map((path) => {return folderPath + "/" + path});
  
  //Append nested folder by calling generate Sidebar
  for (const dir of dirs){
    files.push(generateSidebar("docs/" + dir));
  }
  for (const file of files){
    console.log(file);
  }
  let sidebar = {
    title: folder.substring(folder.lastIndexOf('/') + 1),
    sidebarDepth: 0,
    collapsable: true,
    children: files
  };
  return sidebar;
}

module.exports = {
  title: 'Moseq Reports',
  base: siteBase+"/",
  theme: "craftdocs",
  plugins: [['vuepress-plugin-global-variables', { variables: { appVersion: version, commitRef: COMMIT_REF, commitHash: COMMIT_HASH} }]],
  chainWebpack: config => {
    config.resolve.alias.set('@img', path.resolve(__dirname, "../user_guide/Images"))
  },
  themeConfig: {
    head: [
      ['link', { rel: "apple-touch-icon", sizes: "180x180", href: siteBase+"/apple-touch-icon.png"}],
      ['link', { rel: "icon", type: "image/png", sizes: "32x32", href: siteBase+"/favicon-32x32.png"}],
      ['link', { rel: "icon", type: "image/png", sizes: "16x16", href: siteBase+"/favicon-16x16.png"}],
      ['link', { rel: "manifest", href: siteBase+"/site.webmanifest"}],
      ['link', { rel: "mask-icon", href: siteBase+"/safari-pinned-tab.svg", color: "#5bbad5"}],
      ['link', { rel: "shortcut icon", href: siteBase+"/favicon.ico"}],
      ['meta', { name: "msapplication-TileColor", content: "#da532c"}],
      ['meta', { name: "theme-color", content: "#ffffff"}],
    ],
    nav: [
      { text: 'Github', link: 'https://github.com/tischfieldlab/moseq-reports/'},
      { text: 'Tichfield Lab', link: 'https://github.com/tischfieldlab'},
      { text: 'Abraira Lab', link: 'https://www.abrairalab.org/'}
    ],
    sidebar: [{
        title: 'User Guide',
        sidebarDepth: 1,
        collapsable: false,
        children: [
          '',
          'About.md',
          '/user_guide/Installation.md',
          '/user_guide/UsingMoseq.md',
          '/user_guide/Tools.md',
        ]
      },
      {
        title: 'Developer Guide',
        sidebarDepth: 1,
        collapsable: true,
        children: [
          '/dev_guide/GettingStarted.md',
          generateSidebar('docs/dev_guide/components')
        ]
      },
      // generateSidebar('docs/components')
      // {
      //   title: 'Component Documentation',
      //   sidebarDepth: 0,
      //   children: fs.readdirSync('docs/old_guide').map((path) => { console.log(path); return "/old_guide/" + path.replace('.md', '') })
      // },
    ],
    
    // sidebar: {
    //   '/components/': [
    //     generateSidebar('docs/components')
    //   ],
    //   '/': [
    //     '',
    //     'About',
    //     '/user_guide/Installation',
    //     '/user_guide/GettingStarted',
    //     '/user_guide/Tools',
    //     '/user_guide/DeveloperGuide',
    //     '/user_guide/Components'
    //   ],
    // },
    

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
  