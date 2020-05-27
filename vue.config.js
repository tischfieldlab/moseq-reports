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
                appId: "org.tischfieldlab.reports",
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
                    ]
                },
                linux: {
                    target: [
                        "deb",
                        "AppImage"
                    ],
                    category: "Development"
                },
                win: {
                    // For some reason, this fails on the nsi version... so we are leaving it
                    // out for the moment...
                    target: [
                        "msi"
                    ],
                    icon: "public/img/icons/winapp256x256.ico",
                    certificateSubjectName: "Rutgers, The State University of New Jersey"
                },
                // directories: {
                //     buildResources: "public/img/icons",
                //     output: "dist_electron"
                // },
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