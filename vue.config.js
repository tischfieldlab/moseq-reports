module.exports = {
    publicPath: '',
    assetsDir: '',
    configureWebpack: {
        devtool: 'source-map',
    },
    pluginOptions: {
        electronBuilder: {
            externals: ['plotly.js-dist']
        }
    }
}