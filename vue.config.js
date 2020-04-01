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
                directories: {
                    buildResources: "public/img/icons",
                    output: "dist_electron"
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