const Path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: Path.resolve(__dirname, './index.js'),
  output: {
    filename: 'main.js',
    path: Path.resolve(__dirname, 'dist')
  },
  devServer: {
    hot: true,
    static: {
      directory: Path.resolve(__dirname, 'dist')
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: Path.resolve(__dirname, './index.html')
    }),
    new webpack.HotModuleReplacementPlugin()
  ]
};
