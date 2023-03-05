const presets = [
  [
    "@babel/preset-env",
    {
      modules: false,
    },
  ],
  "@babel/preset-typescript",
];
const plugins = [["lodash"]];

module.exports = {
  presets,
  plugins,
};
