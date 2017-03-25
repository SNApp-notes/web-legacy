module.exports = {
    entry:  __dirname + "/app/app.js",
    output: {
        path: __dirname + "/dist",
        filename: "boundle.js"
    },

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
                loader: 'expose?jQuery'
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
