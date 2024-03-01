const Fs = require('fs');
const Path = require('path');
const { SyncHook } = require('tapable');
const { toUnixPath, tryExtensions, getSourceCode } = require('./utils.js');

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;
const types = require('@babel/types');

class Compiler {
  constructor(options) {
    this.options = options;

    this.hooks = {
      // 开始编译 Hook
      run: new SyncHook(),
      // 写入文件之前 Hook
      emit: new SyncHook(),
      // 完成编译 Hook
      done: new SyncHook()
    };

    // 保存所有入口模块对象
    this.entries = new Set();
    // 保存所有依赖模块对象
    this.modules = new Set();
    // 保存所有代码块 (chunk) 对象
    this.chunks = new Set();
    // 保存本次产出的文件对象
    this.assets = new Set();
    // 保存本次编译所有产出的文件名
    this.files = new Set();
    // 相对路径根路径
    this.rootPath = this.options.context || toUnixPath(process.cwd());
  }

  /**
   * @description: compiler.run() 启动编译
   * @param {*} callback
   */
  run(callback) {
    // 触发 run Hook
    this.hooks.run.call();
    // 获取入口配置对象
    const entry = this.getEntry();
    // 编译入口文件
    this.buildEntryModule(entry);
    // 导出列表之后将每个 chunk 转化称为单独的文件加入到输出列表 assets 中
    this.exportFile(callback);
  }

  /**
   * @description: 获取入口文件路径
   */
  getEntry() {
    let entry = Object.create(null);
    const { entry: optionsEntry } = this.options;
    if (typeof optionsEntry === 'string') {
      entry['main'] = optionsEntry;
    } else {
      entry = optionsEntry;
    }
    // 将 entry 的路径转换为绝对路径
    Object.keys(entry).forEach(key => {
      const value = entry[key];
      if (!Path.isAbsolute(value)) {
        // 转化为绝对路径的同时, 将路径中的 \ 转换为 /
        entry[key] = toUnixPath(Path.join(this.rootPath, value));
      }
    });

    return entry;
  }

  /**
   * @description: buildEntryModule 编译入口文件
   * @param {*} entry
   */
  buildEntryModule(entry) {
    Object.keys(entry).forEach(entryName => {
      const entryPath = entry[entryName];
      // 调用 buildModule 实现真正的模块编译逻辑
      const entryObj = this.buildModule(entryName, entryPath);
      this.entries.add(entryObj);
      // 根据当前入口文件和模块的相互依赖关系，组装成为一个个包含当前入口所有依赖模块的 chunk
      this.buildUpChunk(entryName, entryObj);
    });
  }

  /**
   * @description: buildModule 编译模块
   */
  buildModule(moduleName, modulePath) {
    // 1. 读取文件内容
    const originSourceCode = (this.originSourceCode = Fs.readFileSync(
      modulePath,
      'utf-8'
    ));
    this.moduleCode = originSourceCode;
    // 2. 调用 loader 对文件内容进行编译
    this.handleLoader(modulePath);
    // 3. 进行模块编译, 获得最终 module 对象
    const module = this.handleWebpackCompiler(moduleName, modulePath);
    return module;
  }

  /**
   * @description: handleLoader 匹配 Loader 对文件进行编译处理
   * @param {*} modulePath
   */
  handleLoader(modulePath) {
    const matchLoaders = [];
    // 1. 获取所有传入的 loader 规则
    const rules = this.options.module.rules;
    rules.forEach(loader => {
      const testRule = loader.test;
      if (testRule.test(modulePath)) {
        if (loader.loader) {
          // 对应 { test: /\.js$/g, loader: 'xx-loader' }
          matchLoaders.push(loader.loader);
        } else {
          // 对应 { test: /\.js$/g, use: ['xx-loader'] }
          matchLoaders.push(...loader.use);
        }
      }

      // 2. 从后往前执行 Loader, 传入源代码
      for (let i = matchLoaders.length - 1; i >= 0; i--) {
        // 对应 matchLoaders = ['绝对路径/xx-loader', '绝对路径/xx-loader']
        // require 引入对应 loader
        const loaderFn = require(matchLoaders[i]);
        // 调用 loader 对源代码进行编译
        this.moduleCode = loaderFn(this.moduleCode);
      }
    });
  }

  /**
   * @description: handleWebpackCompiler 进行模块编译, 获得最终 module 对象
   * @param {*} moduleName
   * @param {*} modulePath
   */
  handleWebpackCompiler(moduleName, modulePath) {
    // 将当前模块相对于项目启动根目录计算出相对路径 作为模块ID
    const moduleId = './' + Path.posix.relative(this.rootPath, modulePath);
    // 创建模块对象
    const module = {
      id: moduleId,
      name: [moduleName], // 该模块所属的入口文件
      dependencies: new Set() // 该模块所依赖模块绝对路径地址
    };
    // 将源代码转换为 AST
    const ast = parser.parse(this.moduleCode, {
      sourceType: 'module'
    });
    // 遍历 AST, 分析依赖模块
    traverse(ast, {
      CallExpression: nodePath => {
        const node = nodePath.node;
        if (node.callee.name === 'require') {
          const requirePath = node.arguments[0].value;
          // 寻找模块绝对路径 当前模块路径+require()对应相对路径
          const moduleDirName = Path.posix.dirname(modulePath);
          const absolutePath = tryExtensions(
            Path.posix.join(moduleDirName, requirePath),
            this.options.resolve.extensions,
            requirePath,
            moduleDirName
          );
          // 生成moduleId - 针对于跟路径的模块ID 添加进入新的依赖模块路径
          const moduleId =
            './' + Path.posix.relative(this.rootPath, absolutePath);
          // 通过babel修改源代码中的require变成__webpack_require__语句
          node.callee = types.identifier('__webpack_require__');
          // 修改源代码中require语句引入的模块 全部修改变为相对于跟路径来处理
          node.arguments = [types.stringLiteral(moduleId)];
          // 转化为ids的数组 好处理

          const alreadyModules = Array.from(this.modules).map(i => i.id);
          if (!alreadyModules.includes(moduleId)) {
            // 为当前模块添加require语句造成的依赖(内容为相对于根路径的模块ID)
            module.dependencies.add(moduleId);
          } else {
            // 已经存在的话 虽然不进行添加进入模块编译 但是仍要更新这个模块依赖的入口
            this.modules.forEach(value => {
              if (value.id === moduleId) {
                value.name.push(moduleName);
              }
            });
          }
        }
      }
    });
    // 遍历结束根据AST生成新的代码
    const { code } = generator(ast);
    // 为当前模块挂载新的生成的代码
    module._source = code;
    // 递归依赖深度遍历 存在依赖模块则加入到 this.modules 中
    module.dependencies.forEach(dependency => {
      const depModule = this.buildModule(moduleName, dependency);
      this.modules.add(depModule);
    });
    return module;
  }

  /**
   * @description: buildUpChunk 根据入口文件和依赖模块组装 chunks
   * @param {*} entryName
   * @param {*} entryObj
   */
  buildUpChunk(entryName, entryObj) {
    const chunk = {
      name: entryName, // 每一个入口文件作为一个 chunk
      entryModule: entryObj, // entry 编译后的对象
      modules: Array.from(this.modules).filter(i => {
        return i.name.includes(entryName);
      }) // // 寻找与当前 entry 有关的所有 module
    };
    // 将chunk添加到this.chunks中去
    this.chunks.add(chunk);
  }

  /**
   * @description: 将chunk加入输出列表中去
   * @param {*} callback
   */
  exportFile(callback) {
    const output = this.options.output;
    // 根据 chunks 生成 assets 内容
    this.chunks.forEach(chunk => {
      const parseFileName = output.filename.replace('[name]', chunk.name);
      this.assets[parseFileName] = getSourceCode(chunk);
    });
    // 触发 emit Hook
    this.hooks.emit.call();
    // 先判断目录是否存在 存在直接fs.write 不存在则首先创建
    if (!Fs.existsSync(output.path)) {
      Fs.mkdirSync(output.path);
    }
    // files中保存所有的生成文件名
    this.files = Object.keys(this.assets);
    // 将 assets 中的内容生成打包文件 写入文件系统中
    Object.keys(this.assets).forEach(fileName => {
      const filePath = Path.join(output.path, fileName);
      Fs.writeFileSync(filePath, this.assets[fileName]);
    });
    // 触发 emit Hook
    this.hooks.done.call();
    callback(null, {
      toJson: () => {
        return {
          entries: this.entries,
          modules: this.modules,
          chunks: this.chunks,
          assets: this.assets,
          files: this.files
        };
      }
    });
  }
}

module.exports = Compiler;
