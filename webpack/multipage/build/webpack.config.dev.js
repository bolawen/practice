const Path = require("path");
const { merge } = require("webpack-merge");
const common = require("./webpack.config.common");

module.exports = merge(common, {
  mode: "development",
  devtool: "source-map",
  devServer: {
    port: 9000,
    compress: true,
    client: {
      progress: true,
    },
    static: {
      directory: Path.resolve(process.cwd(), "public"),
    },
  },
});
