var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var webpack = require('webpack');

var production = process.env.NODE_ENV === 'production';

module.exports = {
    entry:  {
        app: path.resolve('./app') + '/app.js'
    },
    output: {
        path: path.resolve('./dist'),
        filename: "[name].js"
    },
    mode: production ? 'production' : 'development',
    optimization: {
        splitChunks: {
            chunks: 'async',
            minSize: 30000,
            minChunks: 1,
            maxAsyncRequests: 6,
            maxInitialRequests: 4,
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
            PRODUCTION: production
        }),
        new CopyWebpackPlugin({
            patterns: [
                {from: 'favicon', to: 'favicon'},
                {from: 'index.php'},
                {from: 'rpc.php'},
                {from: 'json-rpc.php'},
                {from: '.htaccess'}
            ]
        })
    ],
    module: {
        rules: [
            {
                test: /angular(\.min)?\.js$/,
                use: [{
                    loader: 'imports-loader',
                    options: {
                        imports: [
                            "default jquery $"
                        ]
                    }
                }]
            },
            {
                test: /jquery(\.min)?\.js$/,
                use: [{
                    loader: 'expose-loader',
                    options: {
                        exposes: [
                            '$|jQuery'
                        ]
                    }
                }]
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\.css$/,
                use: [
                    {loader: 'style-loader'},
                    {loader: 'css-loader'}
                ]
            },
            {
                test: /\.(eot|woff2?|ttf|svg)$/,
                use: {
                    loader: 'file-loader' +
                        (production ? '?publicPath=assets/&outputPath=/assets/' : '')
                }
            }
        ]
    }
}
