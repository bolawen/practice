const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, './index.js'),
  devtool: false,
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [path.resolve(__dirname, '../core/index.js'), 'css-loader']
      }
    ]
  },
  plugins: [new HtmlWebpackPlugin()]
};
