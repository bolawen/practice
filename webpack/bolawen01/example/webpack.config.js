const Path = require('path');
const Plugin1 = require('../plugins/plugin1.js');
const Plugin2 = require('../plugins/plugin2.js');

function resolve(...path) {
  return Path.resolve(__dirname, ...path);
}

module.exports = {
  devtool: false,
  mode: 'development',
  context: process.cwd(),
  entry: {
    entry1: resolve('./src/entry1.js'),
    entry2: resolve('./src/entry2.js')
  },
  output: {
    path: resolve('./build'),
    filename: '[name].js'
  },
  plugins: [new Plugin1(), new Plugin2()],
  resolve: {
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [
      {
        test: /\.js/,
        use: [resolve('../loaders/loader1.js'), resolve('../loaders/loader1.js')]
      }
    ]
  }
};
