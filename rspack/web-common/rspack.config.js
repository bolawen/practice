const Path = require("path");
const rspack = require("@rspack/core");
const devMode = process.env.NODE_ENV !== "production";

const cssLoader = (modules = false) => {
  return [
    devMode ? "style-loader" : rspack.CssExtractRspackPlugin.loader,
    {
      loader: "css-loader",
      options: {
        modules: modules
          ? {
              namedExport: false,
            }
          : false,
      },
    },
    {
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          plugins: ["autoprefixer"],
        },
      },
    },
  ];
};

const sassLoader = (modules = false) => [...cssLoader(modules), "sass-loader"];
const lessLoader = (modules = false) => [...cssLoader(modules), "less-loader"];

const cssRules = [
  {
    test: /\.css$/,
    exclude: /\.module\.css$/,
    use: cssLoader(),
  },
  {
    type: "javascript/auto",
    test: /\.module\.css$/,
    use: cssLoader(true),
  },
];

const sassRules = [
  {
    test: /\.(sa|sc)ss$/,
    exclude: /\.module\.(sa|sc)ss$/,
    use: sassLoader(),
  },
  {
    type: "javascript/auto",
    test: /\.module\.(sa|sc)ss$/,
    use: sassLoader(true),
  },
];

const lessRules = [
  {
    test: /\.less$/,
    exclude: /\.module\.less$/,
    use: lessLoader(),
  },
  {
    type: "javascript/auto",
    test: /\.module\.less$/,
    use: lessLoader(true),
  },
];

/** @type {import('@rspack/cli').Configuration} */
const config = {
  entry: {
    main: "./src/index.tsx",
  },
  output: {
    path: Path.resolve(__dirname, "dist"),
  },
  experiments: {
    css: false,
  },
  resolve: {
    extensions: ["...", ".jsx", ".tsx", ".ts"],
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        type: 'javascript/auto',
        exclude: [/node_modules/],
        use: [
          {
            loader: "builtin:swc-loader",
            options: {
              sourceMap: true,
              jsc: {
                parser: {
                  syntax: "typescript",
                },
                externalHelpers: true,
              },
            },
          },
        ],
      },
      {
        test: /\.(jsx|tsx)$/,
        type: 'javascript/auto',
        exclude: [/node_modules/],
        use: [
          {
            loader: "builtin:swc-loader",
            options: {
              sourceMap: true,
              jsc: {
                parser: {
                  tsx: true,
                  syntax: "typescript",
                },
                externalHelpers: true,
                transform: {
                  react: {
                    useBuiltins: false,
                    runtime: "automatic",
                    throwIfNamespace: true,
                  },
                },
              },
            },
          },
          {
            loader: "babel-loader",
          },
        ],
      },
      {
        type: "asset/resource",
        test: /\.(png|svg|jpg)$/,
      },
      ...cssRules,
      ...sassRules,
      ...lessRules,
    ],
  },
  plugins: [
    new rspack.HtmlRspackPlugin({
      template: "./index.html",
    }),
    ...(devMode ? [] : [new rspack.CssExtractRspackPlugin()]),
  ],
};

module.exports = config;
