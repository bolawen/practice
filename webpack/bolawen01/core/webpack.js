const Compiler = require('./compiler.js');

function _mergeOptions(options) {
  const shellOptions = process.argv.slice(2).reduce((option, argv) => {
    const [key, value] = argv.split('=');
    if (key && value) {
      const parseKey = key.slice(2);
      option[parseKey] = value;
    }
    return option;
  }, {});
  return { ...options, ...shellOptions };
}

function _loadPlugin(plugins, compiler) {
  if (plugins && Array.isArray(plugins)) {
    plugins.forEach(plugins => {
      plugins.apply(compiler);
    });
  }
}

function webpack(options) {
  // 合并配置， 合并命令行参数和配置文件配置 命令行参数优先级高于配置文件
  const mergeOptions = _mergeOptions(options);
  // 创建 Compiler 对象
  const compiler = new Compiler(mergeOptions);
  // 加载插件
  _loadPlugin(options.plugins, compiler);
  return compiler;
}

module.exports = webpack;
