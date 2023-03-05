const path = require("path");
const RollupPluginHtml = require("@rollup/plugin-html");
const RollupPluginJson = require("@rollup/plugin-json");
const RollupPluginServe = require("rollup-plugin-serve");
const RollupPluginAlias = require("@rollup/plugin-alias");
const RollupPluginBabel = require("@rollup/plugin-babel");
const RollupPluginTerser = require("@rollup/plugin-terser");
const RollupPluginPostcss = require("rollup-plugin-postcss");
const RollupPluginReplace = require("@rollup/plugin-replace");
const RollupPluginCommonjs = require("@rollup/plugin-commonjs");
const RollupPluginLiverLoad = require("rollup-plugin-livereload");
const RollupPluginTypescript = require("@rollup/plugin-typescript");
const RollupPluginNodeResolve = require("@rollup/plugin-node-resolve");

const resolve = (p) => {
  return path.resolve(__dirname, p);
};
const version = require("../package.json").version;
const extensions = {
  babel: [".ts", ".js"],
  common: [".ts", ".tsx", ".js", ".jsx", ".json", ".css", ".sass", ".scss"],
};
const customResolver = RollupPluginNodeResolve({
  extensions: extensions.common,
});
const customHtmlTemplate = async ({
  attributes,
  files,
  meta,
  publicPath,
  title,
}) => {
  const scripts = (files.js || [])
    .map(({ fileName }) => {
      const attrs = RollupPluginHtml.makeHtmlAttributes(attributes.script);
      return `<script src="${publicPath}${fileName}"${attrs}></script>`;
    })
    .join("\n");

  const links = (files.css || [])
    .map(({ fileName }) => {
      const attrs = RollupPluginHtml.makeHtmlAttributes(attributes.link);
      return `<link href="${publicPath}${fileName}" rel="stylesheet"${attrs}>`;
    })
    .join("\n");

  const metas = meta
    .map((input) => {
      const attrs = RollupPluginHtml.makeHtmlAttributes(input);
      return `<meta${attrs}>`;
    })
    .join("\n");

  return `
<!doctype html>
<html${RollupPluginHtml.makeHtmlAttributes(attributes.html)}>
  <head>
    ${metas}
    <title>${title}</title>
    ${links}
    <script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.6.3/jquery.min.js"></script>
    <script src="https://cdn.bootcdn.net/ajax/libs/underscore.js/1.13.6/underscore-umd.min.js"></script>
  </head>
  <body>
    ${scripts}
  </body>
</html>`;
};

const rollupPlugins = [
  RollupPluginJson(),
  RollupPluginAlias({
    entries: [
      { find: "util", replacement: resolve("src/util") },
    ],
    customResolver,
  }),
  RollupPluginBabel.babel({
    babelHelpers: "bundled",
    exclude: ["node_modules/**"],
    extensions: extensions.babel,
  }),
  RollupPluginCommonjs(),
  RollupPluginNodeResolve.nodeResolve({
    extensions: extensions.common,
  }),
  RollupPluginTypescript({
    tsconfig: resolve("tsconfig.json"),
    cacheDir: ".rollup.tscache",
  }),
  RollupPluginReplace({
    ___VERSION__: version,
    preventAssignment: true,
    __DEV__: process.env.NODE_ENV === "development",
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
  }),
  RollupPluginTerser({
    maxWorkers: 4,
  }),
  RollupPluginServe({
    open: true,
    port: 4000,
    contentBase: ["dist"],
  }),
  RollupPluginLiverLoad({
    watch: "dist",
  }),
  RollupPluginPostcss(),
  RollupPluginHtml({
    fileName: "index.html",
    title: "Rollup 通用开发环境",
    template: customHtmlTemplate,
  }),
];

module.exports = {
  cache: true,
  watch: {
    include: "src/**",
    exclude: "node_modules/**"
  },
  input: resolve("src/index.ts"),
  output: {
    file: path.resolve("dist/index.js"),
    format: "umd",
    banner: `/** Rollup 通用开发环境 版本 v${version} **/`,
    name: "RollupName",
    exports: "auto",
    globals: {
      jquery: "$",
      underscore: "_",
    },
  },
  plugins: rollupPlugins,
  external: ["jquery", "underscore"],
};
