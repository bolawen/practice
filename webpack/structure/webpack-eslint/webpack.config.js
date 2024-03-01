const path = require('path');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');

function resolve() {
  return path.resolve(__dirname, ...arguments);
}

module.exports = {
  entry: resolve('./src/index.js'),
  output: {
    filename: 'index.js',
    path: resolve('./dist')
  },
  plugins: [new ESLintWebpackPlugin()]
};
