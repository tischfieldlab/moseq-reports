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
            externals: ['plotly.js-dist', 'hclusterjs'],
            chainWebpackRendererProcess(config) {
                config.plugins.delete('workbox')
                config.plugins.delete('pwa')
            },
            builderOptions: {
                productName: "moseq-reports",
                appId: "org.tischfieldlab.moseq-reports",
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
                        },
                    ],
                },
                mac: {
                    target: [
                        "dmg"
                    ],
                    fileAssociations: [
                        {
                            ext: 'msq',
                            role: 'Editor',
                            icon: 'bundled/img/icons/msq.icns',
                            isPackage: true,
                        },
                    ],
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
                        "msi"
                    ],
                    icon: "public/img/icons/winapp256x256.ico",
                    certificateSubjectName: "Rutgers, The State University of New Jersey",
                    fileAssociations: [
                        {
                            ext: 'msq',
                            description: 'Moseq Data File',
                            icon: 'bundled/img/icons/msq.ico',
                        },
                    ],
                },
                directories: {
                    buildResources: "public/img",
                    output: "dist_electron",
                },
                publish: {
                    provider: "github",
                    owner: "tischfieldlab",
                    repo: "moseq-reports",
                    private: true,
                }
            }
        }
    }
}