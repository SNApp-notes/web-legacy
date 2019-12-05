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
    resolve: {
        alias: {
            'jquery.resize$': path.resolve(__dirname, '../resize/jquery.resize.js')
        }
    },
    optimization: {
        splitChunks: {
            chunks: 'async',
            minSize: 30000,
            maxSize: 0,
            minChunks: 1,
            maxAsyncRequests: 6,
            maxInitialRequests: 4,
            automaticNameDelimiter: '~',
            automaticNameMaxLength: 30,
            cacheGroups: {
                vendor: {
                    test: /node_modules/,
                    name: 'vendor',
                    priority: -10,
                    chunks: 'all',
                    enforce: true
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true
                }
            }
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            PRODUCTION: process.env.NODE_ENV == 'production'
        }),
        new CopyWebpackPlugin([
            {from: 'favicon', to: 'favicon'},
            {from: 'index.php'},
            {from: 'rpc.php'},
            {from: 'json-rpc.php'},
            {from: '.htaccess'}
        ])
    ],
    module: {
        rules: [
            {
                test: /[\/\\]node_modules[\/\\]some-module[\/\\]index\.js$/,
                loader: "imports-loader?define=>false"
            },
            { test: /angular(\.min)?\.js$/, loader: "imports-loader?$=jquery" },
            { test: /jquery(\.min)?\.js$/, loader: 'expose-loader?jQuery' },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['@babel/preset-env']
                }
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
                loader: 'file-loader' +
                    (process.env.NODE_ENV == 'production' ? '?publicPath=assets/&outputPath=/assets/' : '')
            }
        ]
    }
}
