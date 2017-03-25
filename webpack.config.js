var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry:  {
        app: path.resolve('./app') + '/app.js',
        vendor: ["jquery", "angular"]
    },
    output: {
        path: path.resolve('./dist'),
        filename: "[name].js"
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: "vendor",
            minChunks: Infinity,
        })
    ],
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    presets: ['env']
                }
            },
            {
                test: /jquery(\.min)?\.js$/,
                loader: 'expose-loader?jQuery'
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\.css$/,
                loaders: ['style-loader', 'css-loader']
            },
            {
                test: /\.(eot|woff2?|ttf|svg)$/,
                loader: 'file-loader'
            }
        ]
    }
}
