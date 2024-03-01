const Path = require('path');

module.exports = {
  entry: Path.resolve(__dirname, './index.js'),
  mode: 'development',
  output: {
    filename: '[name].js',
    path: Path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: Path.resolve(__dirname, '../core/index.js'),
        options: {
          presets: [['@babel/preset-env', { targets: { chrome: '67' } }]]
        }
      }
    ]
  }
};
