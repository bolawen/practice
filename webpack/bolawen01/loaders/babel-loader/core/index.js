const core = require('@babel/core');

function babelLoader(sourceCode, sourceMap, meta) {
  // 获取loader参数
  const options = this.getOptions() || {};
  // 生成 babel 转译阶段的 sourcemap
  options.sourceMaps = true;
  // 保存之前 loader 传递进入的 sourceMap
  options.inputSourceMap = sourceMap;
  // 获取处理的资源文件名
  options.filename = this.request.split('!').pop().split('/').pop();
  // 调用 babel 的转换方法
  const { code, map, ast } = core.transform(sourceCode, options);
  // 调用 this.callback 表示 loader 执行完毕, 同时传递多个参数给下一个 loader
  this.callback(null, code, map, ast);
}

module.exports = babelLoader;
