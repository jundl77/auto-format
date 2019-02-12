const path = require('path');

const entryPath = path.resolve(__dirname, "./src/index.js");
const outputPath = path.resolve(__dirname, "./lib");

module.exports = {
    entry: entryPath,
    target: 'node',
    module: {
        rules: [
            {test: /\.json$/, use: "json-loader"},
            {test: /\.jsx?$/, exclude: /(node_modules)/, use: ['babel-loader', 'eslint-loader']}
        ]
    },
    output: {
        path: outputPath,
        filename: "lib.min.js",
        libraryTarget: 'umd'
    }
};
