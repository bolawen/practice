const path = require('path');
const CompressAssetsPlugin = require('../core/index.js');

module.exports = {
  devtool: false,
  mode: 'development',
  entry: {
    main: path.resolve(__dirname, './index.js')
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new CompressAssetsPlugin({
      output: 'result.zip'
    })
  ]
};
