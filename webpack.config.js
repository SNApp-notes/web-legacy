var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var webpack = require('webpack');

module.exports = {
    entry:  {
        app: path.resolve('./app') + '/app.js'
    },
    output: {
        path: path.resolve('./dist'),
        filename: "[name].js"
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: "vendor",
            minChunks: function (module) {
                // this assumes your vendor imports exist in the node_modules directory
                return module.context && module.context.indexOf("node_modules") !== -1;
            }
        }),
        new CopyWebpackPlugin([
            {from: 'favicon', to: 'favicon'},
            {from: 'index.html'}
        ])
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
