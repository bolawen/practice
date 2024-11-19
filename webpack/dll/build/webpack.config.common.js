const Path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: Path.resolve(process.cwd(), "./src", "index.ts"),
  output: {
    clean: true,
    filename: "[name].[contenthash].js",
    path: Path.resolve(process.cwd(), "dist"),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ["swc-loader"],
        exclude: /node_modules/,
        include: Path.resolve(process.cwd(), "src"),
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: Path.resolve(process.cwd(), "public", "index.html"),
    }),
  ],
};
