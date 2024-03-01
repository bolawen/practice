const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExternalsWebpackPlugin = require('../core/index.js');

module.exports = {
  devtool: false,
  mode: 'development',
  entry: {
    main: path.resolve(__dirname, './index.js')
  },
  externals: {
    vue: 'Vue',
    lodash: '_',
    jquery: '$'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new ExternalsWebpackPlugin({
      vue: {
        variableName: 'Vue',
        src: 'https://cdn.jsdelivr.net/npm/vue@3.3.11/dist/vue.global.min.js'
      },
      lodash: {
        variableName: '_',
        src: 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js'
      },
      jquery: {
        variableName: '$',
        src: 'https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js'
      }
    })
  ]
};
