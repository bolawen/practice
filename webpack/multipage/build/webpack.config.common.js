const Path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const entryMap = {
  pageA: Path.resolve(process.cwd(), "./src", "pageA/index.ts"),
  pageB: Path.resolve(process.cwd(), "./src", "pageB/index.ts"),
  pageC: Path.resolve(process.cwd(), "./src", "pageC/index.ts"),
};

const getEntry = () => {
  const entry = {
    common: ["lodash"], // 在配置中，APage、BPage 和 CPage 依赖 common，而 common 包含公共模块（如 React 和 lodash），可以共享给所有页面。你提到的 common 没有包含 components 的问题很关键。在多页面项目中，如果 common 仅包含共享的库（如 React、lodash 等），而未包含共享的组件（如 Header.js、Footer.js），会导致这些组件在每个页面的入口中被重复打包。所以，在这里，我们依然保持 common 入口简单，用于明确声明共享的库。但共享组件、方法等提取我们通过 splitChunks 自动优化。为什么不直接在 entry.common 中加入 components？ 如果直接将 components 加入 entry.common，所有共享组件都会被一次性打包到 common.js 中。但实际场景中，不同页面可能只使用部分共享组件。这种方式会导致每个页面加载了不必要的组件，增加页面体积。使用 splitChunks 的 test 和 cacheGroups 配置，可以让 Webpack 动态分析哪些组件被多个页面共享，并将它们提取到单独的 common-components.js，而未被共享的组件则保持在页面入口中。
  };
  for (const key in entryMap) {
    entry[key] = {
      import: entryMap[key],
      dependOn: "common", // dependOn 是 Webpack 5.x 的新功能，用于定义入口之间的依赖关系。在配置中，APage、BPage 和 CPage 依赖 common，而 common 包含公共模块（如  lodash），可以共享给所有页面。作用：1. 避免重复打包公共模块（如 React 和 lodash）； 2. 提高构建速度，减少每个入口的打包体积。
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
          priority: 10, // 提高优先级
        },
        vendors: {
          chunks: "all",
          priority: 9,
          name: "vendors",
          test: /[\\/]node_modules[\\/]/,
        },
        common: {
          priority: 8,
          chunks: "all", // chunks 决定代码分割的作用范围: all：对同步和异步模块都启用代码分割（推荐）。async：仅对异步加载模块分割。initial：仅对同步模块分割。chunks: 'all' 能够统一优化同步和异步模块，提升代码复用率。
          name: "common",
          test: /[\\/]common[\\/]/,
          reuseExistingChunk: true, // 避免生成重复的 chunk， reuseExistingChunk 用于检查是否已经存在可以复用的代码块。如果某些模块已经被打包到某个 chunk 中，则复用该 chunk，而不生成新的代码块。
        },
      },
    },
  },
};
