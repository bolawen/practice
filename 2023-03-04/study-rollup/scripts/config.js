const path = require("path");
const RollupPluginAlias = require("@rollup/plugin-alias");
const RollupPluginReplace = require("@rollup/plugin-replace");
const RollupPluginTypescript = require("@rollup/plugin-typescript");

const version = process.env.VERSION || require("../package.json").version;

const banner = `/** 学习 Vue.js 2.0 构建过程 version ${version} **/`;

const resolve = (p) => {
  return path.resolve(__dirname, "../", p);
};

const builds = {
  development: {
    entry: resolve("src/index.ts"),
    dest: resolve("dist/index.dev.js"),
    format: "cjs",
    env: "development",
    banner,
    moduleName: "development",
  },
  production: {
    entry: resolve("src/index.ts"),
    dest: resolve("dist/index.prod.js"),
    format: "cjs",
    env: "production",
    banner,
    moduleName: "production",
  },
};

function genConfig(name) {
  const opts = builds[name];
  const config = {
    input: opts.entry,
    external: opts.external,
    plugins: [
      RollupPluginAlias({
        entries: Object.assign({}, opts.alias),
      }),
      RollupPluginTypescript({
        tsconfig: path.resolve(__dirname, "../", "tsconfig.json"),
        cacheDir: ".rollup.tscache",
        compilerOptions: {
          types: ["node"],
          target: "es2015",
          module: "ESNext",
          lib: ["es2015", "esnext", "dom"],
        },
        include: ["src/*"],
        exclude: ["node_modules", "dist"],
      }),
    ].concat(opts.plugins || []),
    output: {
      file: opts.dest,
      format: opts.format,
      banner: opts.banner,
      name: opts.moduleName,
      exports: "auto",
    },
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg);
      }
    },
  };
  const vars = {
    __VERSION__: version,
    __DEV__: `process.env.NODE_ENV !== 'production'`,
    __TEST__: false,
    __GLOBAL__: opts.format === "umd" || name.includes("browser"),
  };
  if (opts.env) {
    vars["process.env.NODE_ENV"] = JSON.stringify(opts.env);
    vars.__DEV__ = opts.env !== "production";
  }
  vars.preventAssignment = true;

  console.log(JSON.stringify(vars))

  config.plugins.push(RollupPluginReplace(vars));

  Object.defineProperty(config, "_name", {
    enumerable: false,
    value: name,
  });

  return config;
}

exports.getAllBuilds = () => Object.keys(builds).map(genConfig);
