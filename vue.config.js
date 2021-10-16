const ThreadsPlugin = require('threads-plugin');

module.exports = {
    publicPath: '',
    assetsDir: '',
    configureWebpack: {
        devtool: 'source-map',
        plugins: [
            new ThreadsPlugin({
                target: 'electron-node-worker',
                globalObject: 'self',
            })
        ],
    },
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            externals: ['plotly.js-dist', 'hclusterjs', 'about-window'],
            chainWebpackRendererProcess(config) {
                config.plugins.delete('workbox')
                config.plugins.delete('pwa')
            },
            builderOptions: {
                productName: "moseq-reports",
                appId: "edu.rutgers.tischfieldlab.moseq-reports",
                fileAssociations: [
                    {
                        ext: "msq",
                        name: "Moseq Data File",
                        role: "Editor"
                    }
                ],
                dmg: {
                    contents: [
                        {
                            x: 120,
                            y: 220
                        },
                        {
                            x: 420,
                            y: 220,
                            type: "link",
                            path: "/Applications"
                        }
                    ],
                    publish: ["github"],
                    sign: false
                },
                mac: {
                    hardenedRuntime: true,
                    entitlements: "buildfiles/entitlements.mac.plist",
                    entitlementsInherit: "buildfiles/entitlements.mac.plist",
                    gatekeeperAssess: false,
                    afterSign: "buildfiles/notarize.js"
                },
                linux: {
                    target: [
                        "deb",
                        "AppImage",
                    ],
                    category: "Development",
                    fileAssociations: [
                        {
                            ext: 'msq',
                        },
                    ],
                },
                win: {
                    // For some reason, this fails on the nsi version... so we are leaving it
                    // out for the moment...
                    target: [
                        // "msi",
                        "nsis"
                    ],
                    icon: "public/img/icons/winapp256x256.ico",
                    certificateSubjectName: "Rutgers, The State University of New Jersey",
                    // certificateFile: "test.pfx",
                    publish: ["github"],
                },
                publish: {
                    provider: "github",
                    owner: "tischfieldlab",
                    repo: "moseq-reports",
                    private: true,
                },
            }
        }
    }
}
