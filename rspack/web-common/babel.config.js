const ReactCompilerConfig = {
  /* ... */
};

module.exports = {
  plugins: [
    "@babel/plugin-syntax-jsx",
    ["@babel/plugin-syntax-typescript", { isTSX: true }],
  ],
};
