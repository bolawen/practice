const path = require('path');

function resolve() {
  return path.resolve(__dirname, ...arguments);
}

module.exports = {
  entry: resolve('./src/index.js'),
  output: {
    filename: 'index.js',
    path: resolve('./dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  }
};
