const webpack = require('webpack');
const TerserPlugin = require("terser-webpack-plugin");
const path = require('path');

module.exports = {
    mode: "production",//'production', //code only minimised when mode == production
    name: 'cgDNAweb',
    entry: './src/cgDNAweb_main.js',
    output: {
        path: path.resolve(__dirname, '.'),
        filename: './cgDNAweb.js'
    },
    optimization: {
        minimize: false,
        //minimizer: [new TerserPlugin()],
    },
};
