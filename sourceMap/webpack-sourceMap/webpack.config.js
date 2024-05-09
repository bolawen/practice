const Path = require("path");

function resolve(path) {
  return Path.resolve(__dirname, path);
}

module.exports = {
  mode: "production",
  entry: resolve("./index.js"),
  devtool: "source-map",
  output: {
    clean: true,
    path: resolve("build"),
    filename: "[name]-[contenthash].js",
  },
};
