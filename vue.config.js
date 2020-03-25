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
                "publish": ['github']
            }
        }
    }
}