var webpack = require('webpack');

module.exports = {
    entry: "./src/index.js",
    module: {
        loaders: [
            {test: /\.json$/, loader: "json-loader"},
            {test: /\.jsx?$/, exclude: /(node_modules)/, loader: 'babel-loader'}
        ]
    },
    output: {
        path: "./lib",
        filename: "lib.min.js"
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"'
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({mangle: false, sourcemap: false})
    ]
};
