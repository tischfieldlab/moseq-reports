module.exports = {
    publicPath: '',
    assetsDir: '',
    configureWebpack: {
        devtool: 'source-map',
    },
    pluginOptions: {
        electronBuilder: {
            externals: ['plotly.js-dist', 'hclusterjs'],
            chainWebpackRendererProcess(config) {
                config.plugins.delete('workbox')
                config.plugins.delete('pwa')
            },
            builderOptions: {
                productName: "moseq-reporsts",
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
                win: {
                    target: [
                        "nsis",
                        "msi"
                    ]
                },
                linux: {
                    target: [
                        "deb",
                        "AppImage"
                    ],
                    category: "Development"
                },
                // NOTE: This is for app icons stuff when we have them
                // directories: {
                //     buildResources: "resources",
                //     output: "release"
                // },
                publish: {
                    provider: "github",
                    owner: "tischfieldlab",
                    repo: "moseq-reports",
                    private: true
                }
            }
        }
    }
}