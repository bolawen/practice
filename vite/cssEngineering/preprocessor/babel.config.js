export default {
  presets: [
    [
      '@babel/preset-env',
      {
        // 指定兼容的浏览器版本
        targets: {
          ie: '11'
        },
        // 基础库 core-js 的版本，一般指定为最新的大版本
        corejs: 3,
        // Polyfill 注入策略，后文详细介绍
        useBuiltIns: 'usage',
        // 不将 ES 模块语法转换为其他模块语法
        modules: false
      }
    ]
  ]
};
