const ThreadsPlugin = require('threads-plugin');

module.exports = {
    publicPath: '',
    assetsDir: '',
    configureWebpack: {
        devtool: 'source-map',
        plugins: [
            new ThreadsPlugin()
        ],
    },
    pluginOptions: {
        electronBuilder: {
            externals: ['plotly.js-dist', 'hclusterjs'],
            chainWebpackRendererProcess(config) {
                config.plugins.delete('workbox')
                config.plugins.delete('pwa')
            }
        }
    }
}