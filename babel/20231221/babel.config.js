export default {
  presets: [
    [
      '@babel/preset-env',
      {
        corejs: 3,
        modules: false,
        useBuiltIns: "usage"
      }
    ]
  ],
};
