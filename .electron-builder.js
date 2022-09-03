/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  asar: true,
  files: ["dist"],
  productName: "moseq-reports",
  appId: "edu.rutgers.tischfieldlab.moseq-reports",
  fileAssociations: [
    {
      ext: "msq",
      name: "Moseq Data File",
      role: "Editor",
    },
  ],
  dmg: {
    contents: [
      {
        x: 120,
        y: 220,
      },
      {
        x: 420,
        y: 220,
        type: "link",
        path: "/Applications",
      },
    ],
    publish: ["github"],
    sign: false,
  },
  mac: {
    hardenedRuntime: true,
    entitlements: "buildfiles/entitlements.mac.plist",
    entitlementsInherit: "buildfiles/entitlements.mac.plist",
    gatekeeperAssess: false,
  },
  linux: {
    target: ["deb", "AppImage"],
    category: "Development",
    fileAssociations: [
      {
        ext: "msq",
      },
    ],
  },
  win: {
    target: ["nsis"],
    icon: "public/img/icons/winapp256x256.ico",
    // certificateSubjectName: "Rutgers, The State University of New Jersey",
    publish: ["github"],
  },
  nsis: {
    oneClick: true,
  },
  publish: {
    provider: "github",
    owner: "tischfieldlab",
    repo: "moseq-reports",
    private: true,
  },
  afterSign: "buildfiles/notarize.js",
};

module.exports = config;
