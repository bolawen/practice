const path = require('path');

function resolve() {
  return path.resolve(__dirname, ...arguments);
}

module.exports = {
  entry: resolve('./src/index.ts'),
  output: {
    filename: 'index.js',
    path: resolve('./dist')
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
};
