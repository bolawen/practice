const Path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const entryMap = {
  pageA: Path.resolve(process.cwd(), "./src", "pageA/index.ts"),
  pageB: Path.resolve(process.cwd(), "./src", "pageB/index.ts"),
  pageC: Path.resolve(process.cwd(), "./src", "pageC/index.ts"),
};

const getEntry = () => {
  const entry = {};
  for (const key in entryMap) {
    entry[key] = {
      import: entryMap[key],
    };
  }
  return entry;
};

const getEntryHtmlWebpackPlugin = () => {
  const plugins = [];
  for (const entry in entryMap) {
    plugins.push(
      new HtmlWebpackPlugin({
        filename: `${entry}/index.html`, // 每个 entry 的 HTML 文件放到对应目录
        template: Path.resolve(process.cwd(), "public", `index.html`),
        chunks: [entry, "common", "runtime"], // chunks 属性指定页面需要加载的 JS 资源， 然后只加载当前页面需要的 JS。在多页面应用中，默认所有入口文件的资源都会注入到页面中，导致 资源冗余 和 加载性能下降。使用 chunks 可以精确控制页面引入的 JS。不配置 chunks 的后果：页面可能加载与其无关的入口资源（如 BPage 和 CPage），导致体积变大。
      })
    );
  }
  return plugins;
};

module.exports = {
  entry: getEntry(),
  output: {
    clean: true, // 每次构建清理旧文件
    path: Path.resolve(process.cwd(), "dist"),
    filename: "[name]/[name].[contenthash:8].js", // 按 entry 名称创建子目录
    chunkFilename: "[name]/[id].[contenthash:8].js", // 懒加载模块也按 entry 存放
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
  plugins: [...getEntryHtmlWebpackPlugin()],
  optimization: {
    minimize: true,
    runtimeChunk: "single", // 提取 runtime，优化加载, 优化运行时和公共模块，显著降低每个页面的体积。
    splitChunks: {
      chunks: "all", // 分割同步和异步模块
      cacheGroups: {
        lodash: {
          name: "lodash", // 输出文件名为 lodash.js
          test: /[\\/]node_modules[\\/]lodash[\\/]/, // 匹配 lodash
          chunks: "all",
          priority: 10,
        },
        vendors: {
          chunks: "all",
          priority: 9,
          name: "vendors",
          test: /[\\/]node_modules[\\/]/,
        },
        common: {
          priority: 8,
          minSize: 0,
          chunks: "all",
          name: "common",
          reuseExistingChunk: true,
          test: /[\\/]src[\\/]common[\\/]/,
        },
      },
    },
  },
};
