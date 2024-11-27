
const path = require('path');

module.exports = {
  // ...existing code...
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: path.resolve(__dirname, 'build/loader/preprocess-loader.js'),
            options: {
              // your options here
            },
          },
        ],
      },
      // ...existing code...
    ],
  },
  // ...existing code...
};